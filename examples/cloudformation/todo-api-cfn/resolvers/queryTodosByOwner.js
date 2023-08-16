import { util } from '@aws-appsync/utils';

export function request(ctx) {
	const { owner, first = 20, after } = ctx.args;
	return dynamodbQueryRequest('owner', owner, 'owner-index', first, after);
}

export function response(ctx) {
	const { error, result } = ctx;
	if (error) {
		return util.appendError(error.message, error.type, result);
	}
	return result;
}

function dynamodbQueryRequest(key, value, index, limit, nextToken) {
	const expression = `#key = :key`;
	const expressionNames = { '#key': key };
	const expressionValues = util.dynamodb.toMapValues({ ':key': value });
	return {
		operation: 'Query',
		query: { expression, expressionNames, expressionValues },
		index,
		limit,
		nextToken,
		scanIndexForward: true,
		select: 'ALL_ATTRIBUTES',
	};
}
