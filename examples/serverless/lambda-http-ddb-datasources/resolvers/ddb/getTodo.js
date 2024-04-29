import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
	return ddb.get({ key: { id: ctx.arguments.id } });
}

export function response(ctx) {
	return ctx.result;
}
