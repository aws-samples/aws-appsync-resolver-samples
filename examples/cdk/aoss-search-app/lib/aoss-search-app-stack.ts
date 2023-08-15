import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppSyncHelper } from './appsync-helper';
import path = require('node:path');
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as opensearchserverless from 'aws-cdk-lib/aws-opensearchserverless';

export class AossSearchAppStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const httpDatasourceRole = new iam.Role(this, 'Role', {
			assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
			description: 'role for http resource',
		});
		httpDatasourceRole.addToPolicy(
			new iam.PolicyStatement({ actions: ['aoss:*'], resources: ['*'] })
		);

		const appSyncApp = new AppSyncHelper(this, 'SearchTodoAPI', {
			basedir: path.join(__dirname, 'appsync'),
			logConfig: {
				fieldLogLevel: appsync.FieldLogLevel.ALL,
				excludeVerboseContent: false,
				retention: cdk.aws_logs.RetentionDays.ONE_WEEK,
			},
			xrayEnabled: true,
		});

		const collectionName = 'todos';

		const encPolicy = new opensearchserverless.CfnSecurityPolicy(this, 'EncPolicy', {
			name: 'encryption-policy',
			type: 'encryption',
			policy: JSON.stringify({
				Rules: [{ ResourceType: 'collection', Resource: [`collection/${collectionName}`] }],
				AWSOwnedKey: true,
			}),
		});

		const netPolicy = new opensearchserverless.CfnSecurityPolicy(this, 'NetworkPolicy', {
			name: 'network-default',
			type: 'network',
			policy: JSON.stringify([
				{
					Rules: [
						{ ResourceType: 'collection', Resource: [`collection/${collectionName}`] },
						{ ResourceType: 'dashboard', Resource: [`collection/${collectionName}`] },
					],
					AllowFromPublic: true,
				},
			]),
		});

		const dataAccessPolicy = new opensearchserverless.CfnAccessPolicy(this, 'AccessPolicy', {
			name: 'default',
			type: 'data',
			policy: JSON.stringify([
				{
					Description: 'Access for appsync',
					Rules: [
						{ ResourceType: 'index', Resource: ['index/*/*'], Permission: ['aoss:*'] },
						{
							ResourceType: 'collection',
							Resource: [`collection/${collectionName}`],
							Permission: ['aoss:*'],
						},
					],
					Principal: [httpDatasourceRole.roleArn],
				},
			]),
		});

		const collection = new opensearchserverless.CfnCollection(this, 'todos-collection', {
			name: collectionName,
			description: 'a collection of todos',
			type: 'SEARCH',
		});
		collection.addDependency(encPolicy);
		collection.addDependency(netPolicy);
		collection.addDependency(dataAccessPolicy);

		const aossDS = new appsync.CfnDataSource(appSyncApp, 'aoss', {
			apiId: appSyncApp.apiId,
			name: 'aoss',
			serviceRoleArn: httpDatasourceRole.roleArn,
			type: 'HTTP',
			httpConfig: {
				endpoint: collection.attrCollectionEndpoint,
				authorizationConfig: {
					authorizationType: 'AWS_IAM',
					awsIamConfig: {
						signingRegion: cdk.Stack.of(this).region,
						signingServiceName: 'aoss',
					},
				},
			},
		});
		appSyncApp.addCfnDataSource(aossDS);
		appSyncApp.bind();
	}
}
