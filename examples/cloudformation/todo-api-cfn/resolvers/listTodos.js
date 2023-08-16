import { util } from '@aws-appsync/utils';

export function request(ctx) {
	const { filter: f, limit = 20, nextToken } = ctx.args;
	const filter = f ? JSON.parse(util.transform.toDynamoDBFilterExpression(f)) : null;
	return { operation: 'Scan', filter, limit, nextToken };
}

export function response(ctx) {
	const { error, result } = ctx;
	if (error) {
		return util.appendError(error.message, error.type, result);
	}
	const { items = [], nextToken } = result;
	return { items, nextToken };
}
