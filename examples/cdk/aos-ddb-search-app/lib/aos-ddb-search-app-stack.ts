import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppSyncHelper } from './appsync-helper';
import path = require('node:path');
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as opensearchserverless from 'aws-cdk-lib/aws-opensearchserverless';

export class AosDdbSearchAppStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const httpDSRole = new iam.Role(this, 'Role', {
			assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
			description: 'roll for http resource',
		});
		httpDSRole.addToPolicy(new iam.PolicyStatement({ actions: ['aoss:*'], resources: ['*'] }));

		const appSyncApp = new AppSyncHelper(this, 'SearchTodoAPI', {
			basedir: path.join(__dirname, 'appsync'),
			logConfig: { fieldLogLevel: appsync.FieldLogLevel.ALL },
			xrayEnabled: true,
		});

		const todoTable = new dynamodb.Table(this, 'TodoTable', {
			partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
		});

		const encPolicy = new opensearchserverless.CfnSecurityPolicy(this, 'EncPolicy', {
			name: 'encryption-policy',
			type: 'encryption',
			policy: JSON.stringify({
				Rules: [{ ResourceType: 'collection', Resource: ['collection/todos'] }],
				AWSOwnedKey: true,
			}),
		});

		const netPolicy = new opensearchserverless.CfnSecurityPolicy(this, 'NetworkPolicy', {
			name: 'network-default',
			type: 'network',
			policy: JSON.stringify([
				{
					Rules: [
						{ ResourceType: 'collection', Resource: ['collection/todos'] },
						{ ResourceType: 'dashboard', Resource: ['collection/todos'] },
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
						{ ResourceType: 'collection', Resource: ['collection/todos'], Permission: ['aoss:*'] },
					],
					Principal: [httpDSRole.roleArn],
				},
			]),
		});
		const collection = new opensearchserverless.CfnCollection(this, 'Collection', {
			name: 'todos',
			description: 'a collection of todos',
			type: 'SEARCH',
		});
		collection.addDependency(encPolicy);
		collection.addDependency(netPolicy);
		collection.addDependency(dataAccessPolicy);

		const aossDS = new appsync.CfnDataSource(appSyncApp, 'aos', {
			apiId: appSyncApp.apiId,
			name: 'aoss',
			serviceRoleArn: httpDSRole.roleArn,
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
		// appSyncApp.addHttpDataSource('aos', collection.attrCollectionEndpoint);
		appSyncApp.addNoneDataSource('NONE');
		appSyncApp.addDynamoDbDataSource('todos', todoTable);
		appSyncApp.addCfnDataSource('aoss', aossDS);
		appSyncApp.bind();
	}
}
