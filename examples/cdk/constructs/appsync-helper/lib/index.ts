import { Construct } from 'constructs';
import {
	AppsyncFunction,
	Code,
	FunctionRuntime,
	GraphqlApi,
	BaseDataSource,
	Resolver,
	SchemaFile,
	GraphqlApiBase,
	DataSourceOptions,
	ExtendedResolverProps,
	HttpDataSourceOptions,
	GraphqlApiProps,
	CfnDataSource,
	CfnFunctionConfiguration,
} from 'aws-cdk-lib/aws-appsync';
import { IDomain as IOpenSearchDomain } from 'aws-cdk-lib/aws-opensearchservice';
import * as fs from 'node:fs';
import { GraphQLObjectType, isObjectType } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import * as esbuild from 'esbuild';
import { readFileSync } from 'node:fs';
import { CfnResource } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { IEventBus } from 'aws-cdk-lib/aws-events';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { IServerlessCluster } from 'aws-cdk-lib/aws-rds';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import path = require('node:path');

const SCHEMA_DEFINITIONS = `
scalar AWSTime
scalar AWSDateTime
scalar AWSTimestamp
scalar AWSEmail
scalar AWSJSON
scalar AWSURL
scalar AWSPhone
scalar AWSIPAddress
scalar BigInt
scalar Double

directive @aws_subscribe(mutations: [String!]!) on FIELD_DEFINITION

# Allows transformer libraries to deprecate directive arguments.
directive @deprecated(reason: String!) on INPUT_FIELD_DEFINITION | ENUM

directive @aws_auth(cognito_groups: [String!]!) on FIELD_DEFINITION
directive @aws_api_key on FIELD_DEFINITION | OBJECT
directive @aws_iam on FIELD_DEFINITION | OBJECT
directive @aws_oidc on FIELD_DEFINITION | OBJECT
directive @aws_cognito_user_pools(
  cognito_groups: [String!]
) on FIELD_DEFINITION | OBJECT
`;

const DEF_RESOLVER_CODE = `
export function request(){ return {} }
export function response(ctx){ return ctx.prev.result}
`.trim();

const TS_CONFIG =
	`{ "compilerOptions": { "target": "es2021", "module": "Node16", "noEmit": true, "moduleResolution": "node" } }`.trim();

type BaseResolver = {
	key: string;
	kind: 'UNIT' | 'PIPELINE';
	typeName: string;
	fieldName: string;
};

type UnitResolverFile = BaseResolver & {
	kind: 'UNIT';
	dsName: string;
};

type PipelineResolverGroup = BaseResolver & {
	kind: 'PIPELINE';
	hasCode?: boolean;
	fns: AppSyncFn[];
};

type AppSyncFn = {
	name: string;
	description?: string;
	key: string;
	dsName: string;
	order: number;
};

export interface AppSyncHelperProps extends Omit<GraphqlApiProps, 'schema' | 'name'> {
	name?: string;
	basedir: string;
}

export class AppSyncHelper extends GraphqlApiBase {
	private basedir: string;
	private bindCalled = false;

	public readonly api: GraphqlApi;

	/**
	 * a map of datasource names to datasources.
	 */
	private readonly datasources: Record<string, BaseDataSource> = {};

	/**
	 * a map of resolver names to resolvers.
	 */
	public readonly resolvers: Record<string, Resolver> = {};

	/**
	 * a map of resolver names to a sparse array of functions.
	 */
	public readonly functions: Record<string, (AppsyncFunction | undefined)[]> = {};

	constructor(scope: Construct, id: string, props: AppSyncHelperProps) {
		super(scope, id);

		const { basedir, name: propsName, ...rest } = props;

		const name = propsName ?? id;
		this.basedir = basedir;
		const apiId = path.basename(basedir);
		this.api = new GraphqlApi(this, apiId, {
			name,
			...rest,
			schema: SchemaFile.fromAsset(path.join(basedir, 'schema.graphql')),
		});
	}

	public get apiId() {
		return this.api.apiId;
	}
	public get arn() {
		return this.api.arn;
	}

	private connect(datasource: BaseDataSource) {
		this.datasources[datasource.name] = datasource;
	}

	public addCfnDataSource(ds: CfnDataSource) {
		const datasource = {
			name: ds.name,
			ds,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			createResolver: (id: string, props: unknown) => {
				throw new Error('not implemented');
				return;
			},
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			createFunction: (id: string, props: unknown) => {
				throw new Error('not implemented');
				return;
			},
		} as BaseDataSource;
		this.connect(datasource);
		return datasource;
	}

	public bind() {
		if (this.bindCalled) {
			throw new Error('bind() already called');
		}
		const schemaStr = readFileSync(path.join(this.basedir, 'schema.graphql'), 'utf-8');
		const typeDefs = SCHEMA_DEFINITIONS + schemaStr;
		const schema = makeExecutableSchema({ typeDefs });
		const types = schema.getTypeMap();

		const resolverFiles = this.getUnitResolvers();
		const pipelines = this.getPipelineResolvers();

		for (const resolverFile of [...resolverFiles, ...pipelines]) {
			// make sure the type exists on the schema
			const type = types[resolverFile.typeName];
			if (!type || !isObjectType(type)) {
				throw new Error(`Type ${resolverFile.typeName} not defined in schema`);
			}

			// make sure the field exists on the type
			const fields = (type as GraphQLObjectType).getFields();
			const field = fields[resolverFile.fieldName];
			if (!field) {
				throw new Error(
					`Field ${resolverFile.fieldName} not defined on type ${resolverFile.typeName}`
				);
			}

			if (resolverFile.kind === 'UNIT') {
				this.buildResolver(resolverFile);
			} else {
				this.buildPieplineResolver(resolverFile);
			}
		}
		this.bindCalled = true;
	}

	private build(key: string) {
		const result = esbuild.buildSync({
			bundle: true,
			write: false,
			outdir: path.dirname(key),
			// outbase: path.dirname(fn.key),
			entryPoints: [key],
			format: 'esm',
			platform: 'node',
			target: 'node16',
			sourcemap: 'inline',
			sourcesContent: false,
			tsconfigRaw: TS_CONFIG,
			external: ['@aws-appsync/utils'],
		});
		if (result.errors.length) {
			throw new Error('Could not build' + key + ': ' + result.errors.join('\n'));
		}
		fs.writeFileSync(result.outputFiles[0].path, result.outputFiles[0].text);
		return result.outputFiles[0];
	}

	private buildPieplineResolver(resolverFile: PipelineResolverGroup) {
		const { typeName, fieldName } = resolverFile;
		const fns: { order: number; fn: AppsyncFunction }[] = [];
		const resId = `${typeName}_${fieldName}`;

		for (const fn of resolverFile.fns) {
			const dataSource = this.datasources[fn.dsName];
			if (!dataSource) {
				throw new Error('datasource undefined: ' + fn.dsName);
			}

			const buildResult = this.build(fn.key);
			const fnId = `FN_${typeName}_${fieldName}_${fn.order}`;
			const fnR = new AppsyncFunction(this.api, fnId, {
				api: this.api,
				name: fnId,
				description: fn.description,
				dataSource,
				code: Code.fromInline(buildResult.text),
				runtime: FunctionRuntime.JS_1_0_0,
			});
			// make sure function version is not set
			delete (fnR.node.defaultChild as CfnFunctionConfiguration)?.functionVersion;
			fns.push({ order: fn.order, fn: fnR });
		}
		const pipelineConfig = fns.sort((a, b) => a.order - b.order).map((obj) => obj.fn);
		const max = fns[fns.length - 1].order;
		this.functions[resId] = new Array(max + 1);
		fns.forEach((fn) => (this.functions[resId][fn.order] = fn.fn));

		let code: Code;
		if (resolverFile.hasCode) {
			const buildResult = this.build(path.join(resolverFile.key, 'index.ts'));
			code = Code.fromInline(buildResult.text);
		} else {
			code = Code.fromInline(DEF_RESOLVER_CODE);
		}

		const resolver = new Resolver(this.api, resId, {
			api: this.api,
			typeName,
			fieldName,
			code,
			runtime: FunctionRuntime.JS_1_0_0,
			pipelineConfig,
		});

		this.resolvers[resId] = resolver;
	}

	private buildResolver(resolverFile: UnitResolverFile) {
		const { typeName, fieldName } = resolverFile;
		const dataSource = this.datasources[resolverFile.dsName];
		if (!dataSource) {
			throw new Error('datasource undefined: ' + resolverFile.dsName);
		}

		const buildResult = this.build(resolverFile.key);
		const resId = `${typeName}_${fieldName}`;
		const resolver = new Resolver(this.api, resId, {
			api: this.api,
			dataSource,
			typeName,
			fieldName,
			code: Code.fromInline(buildResult.text),
			runtime: FunctionRuntime.JS_1_0_0,
		});
		this.resolvers[resId] = resolver;
	}

	/**
	 * Finds available resolvers files in the resolvers folder
	 * @returns a list of resolver locations
	 */
	getUnitResolvers() {
		const resolverPath = path.join(this.basedir, 'resolvers');
		if (!fs.existsSync(resolverPath)) {
			// noop
			return [];
		}
		let folders: fs.Dirent[] = [];
		folders = fs.readdirSync(resolverPath, { withFileTypes: true });

		const RES_LOC_REG = /^(?<typeName>\w+)\.(?<fieldName>\w+)\.\[(?<ds>\w+)\]\.(ts)$/;

		// find all the resolvers and create a single function pipeline resolver
		const resolvers =
			folders
				.filter((d) => d.isFile)
				.filter((f) => f.name.match(RES_LOC_REG))
				.map<UnitResolverFile>((d) => {
					const name = d.name;
					const m = name.match(RES_LOC_REG)!;
					const key: string = path.join(this.basedir, 'resolvers', name);
					return {
						key,
						kind: 'UNIT',
						dsName: m.groups!.ds,
						typeName: m.groups!.typeName,
						fieldName: m.groups!.fieldName,
					};
				}) ?? [];
		// resolverMappings.push(...directMappings)
		// return resolverMappings
		return resolvers;
	}

	/**
	 * Finds pipeline resolvers files in the resolvers folder
	 * @returns a list of resolver locations
	 */
	getPipelineResolvers() {
		const resolverPath = path.join(this.basedir, 'resolvers');
		if (!fs.existsSync(resolverPath)) {
			// noop
			return [];
		}

		let folders: fs.Dirent[] = [];
		folders = fs.readdirSync(resolverPath, { withFileTypes: true });

		const RES_DIR_REG = /^(?<typeName>\w+)\.(?<fieldName>\w+)$/;
		const FN_LOC_REG = /^((?<description>\w+)\.)?(?<order>\d+)\.\[(?<ds>\w+)\]\.(ts)$/;

		// find all the resolvers and create a single function pipeline resolver
		const resolvers =
			folders
				.filter((entry) => entry.isDirectory())
				.filter((entry) => entry.name.match(RES_DIR_REG))
				.map<PipelineResolverGroup>((entry) => {
					const name = entry.name;
					const m = name.match(RES_DIR_REG)!;
					const key = path.join(this.basedir, 'resolvers', name);
					return {
						key,
						kind: 'PIPELINE',
						typeName: m.groups!.typeName,
						fieldName: m.groups!.fieldName,
						fns: [],
					};
				}) ?? [];

		// for each pipeline function directory, find the functions
		for (const resolver of resolvers) {
			const entries = fs.readdirSync(resolver.key);

			// check if there is an index file for this pipeline
			const index = entries.filter((i) => i.match(/index\.ts/));
			resolver.hasCode = index.length > 0;

			const fnEntries = entries.filter((i) => i.match(FN_LOC_REG));
			const fns = fnEntries.map<AppSyncFn>((entry) => {
				const m = entry.match(FN_LOC_REG)!;
				return {
					name: `${resolver.typeName}_${resolver.fieldName}_${m.groups!.order}`,
					description: m.groups!.description,
					key: path.join(resolver.key, entry),
					dsName: m.groups!.ds,
					order: parseInt(m.groups!.order),
				};
			});
			resolver.fns.push(...fns);
		}
		return resolvers;
	}

	// from base

	addNoneDataSource(id: string, options?: DataSourceOptions) {
		const ds = this.api.addNoneDataSource(id, options);
		this.connect(ds);
		return ds;
	}

	addDynamoDbDataSource(id: string, table: ITable, options?: DataSourceOptions) {
		const ds = this.api.addDynamoDbDataSource(id, table, options);
		this.connect(ds);
		return ds;
	}

	addHttpDataSource(id: string, endpoint: string, options?: HttpDataSourceOptions) {
		const ds = this.api.addHttpDataSource(id, endpoint, options);
		this.connect(ds);
		return ds;
	}
	addLambdaDataSource(id: string, lambdaFunction: IFunction, options?: DataSourceOptions) {
		const ds = this.api.addLambdaDataSource(id, lambdaFunction, options);
		this.connect(ds);
		return ds;
	}
	addRdsDataSource(
		id: string,
		serverlessCluster: IServerlessCluster,
		secretStore: ISecret,
		databaseName?: string,
		options?: DataSourceOptions
	) {
		const ds = this.api.addRdsDataSource(id, serverlessCluster, secretStore, databaseName, options);
		this.connect(ds);
		return ds;
	}

	addEventBridgeDataSource(id: string, eventBus: IEventBus, options?: DataSourceOptions) {
		const ds = this.api.addEventBridgeDataSource(id, eventBus, options);
		this.connect(ds);
		return ds;
	}
	addOpenSearchDataSource(id: string, domain: IOpenSearchDomain, options?: DataSourceOptions) {
		const ds = this.api.addOpenSearchDataSource(id, domain, options);
		this.connect(ds);
		return ds;
	}
	createResolver(id: string, props: ExtendedResolverProps) {
		return this.api.createResolver(id, props);
	}
	addSchemaDependency(construct: CfnResource) {
		return this.api.addSchemaDependency(construct);
	}
}
