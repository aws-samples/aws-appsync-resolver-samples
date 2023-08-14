import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import path = require('path');
import { AppSyncHelper } from './appsync-helper';

export class PubSubAppStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const userPool = new cognito.UserPool(this, 'UserPool', {
			userPoolName: 'PubSubAppUserPool',
			selfSignUpEnabled: true,
			autoVerify: { email: true },
			standardAttributes: { email: { required: true } },
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		const client = userPool.addClient('customer-app-client-web', {
			preventUserExistenceErrors: true,
			authFlows: { userPassword: true, userSrp: true },
		});

		const appSyncApp = new AppSyncHelper(this, 'LocalMessageAPI', {
			basedir: path.join(__dirname, 'appsync'),
			authorizationConfig: {
				defaultAuthorization: {
					authorizationType: appsync.AuthorizationType.API_KEY,
					apiKeyConfig: { name: 'default', description: 'default auth mode' },
				},
				additionalAuthorizationModes: [
					{
						authorizationType: appsync.AuthorizationType.USER_POOL,
						userPoolConfig: { userPool },
					},
				],
			},
			logConfig: {
				fieldLogLevel: appsync.FieldLogLevel.ALL,
				excludeVerboseContent: false,
				retention: cdk.aws_logs.RetentionDays.ONE_WEEK,
			},
			xrayEnabled: true,
		});
		appSyncApp.addNoneDataSource('NONE');
		appSyncApp.bind();

		new cdk.CfnOutput(this, 'GRAPHQLENDPOINT', { value: appSyncApp.api.graphqlUrl });
		new cdk.CfnOutput(this, 'REGION', { value: cdk.Stack.of(this).region });
		new cdk.CfnOutput(this, 'AUTHTYPE', { value: 'API_KEY' });
		new cdk.CfnOutput(this, 'APIKEY', { value: appSyncApp.api.apiKey! });
		new cdk.CfnOutput(this, 'USERPOOLSID', { value: userPool.userPoolId });
		new cdk.CfnOutput(this, 'USERPOOLSWEBCLIENTID', { value: client.userPoolClientId });
	}
}
