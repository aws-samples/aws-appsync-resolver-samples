import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
	const key = { id: util.autoId() };
	const item = ctx.args.input;
	const condition = { id: { attributeExists: false } };
	return ddb.put({ key, item, condition });
}

export const response = (ctx) => ctx.result;
