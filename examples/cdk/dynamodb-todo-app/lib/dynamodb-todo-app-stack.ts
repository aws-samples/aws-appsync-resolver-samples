import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppSyncHelper } from './appsync-helper';
import path = require('node:path');
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { FieldLogLevel } from 'aws-cdk-lib/aws-appsync';

export class DynamodbTodoAppStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const todoTable = new dynamodb.Table(this, 'TodoTable', {
			partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
		});
		const appSyncApp = new AppSyncHelper(this, 'TodoAPI', {
			basedir: path.join(__dirname, 'appsync'),
			logConfig: { fieldLogLevel: FieldLogLevel.ALL },
			xrayEnabled: true,
		});
		appSyncApp.addDynamoDbDataSource('todos', todoTable);
		appSyncApp.bind();

		new cdk.CfnOutput(this, 'GRAPHQLENDPOINT', { value: appSyncApp.api.graphqlUrl });
		new cdk.CfnOutput(this, 'REGION', { value: cdk.Stack.of(this).region });
		new cdk.CfnOutput(this, 'AUTHTYPE', { value: 'API_KEY' });
		new cdk.CfnOutput(this, 'APIKEY', { value: appSyncApp.api.apiKey! });
	}
}
