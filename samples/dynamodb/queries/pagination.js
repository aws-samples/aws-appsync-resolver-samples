import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

/**
 * Queries a DynamoDB table, limits the number of returned items, and paginates with the provided `nextToken`
 * @param {import('@aws-appsync/utils').Context<{id: string; limit?: number; nextToken?:string}>} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBQueryRequest} the request
 */
export function request(ctx) {
	const { id, limit = 20, nextToken } = ctx.args;
	return ddb.query({ query: { id: { eq: id } }, limit, nextToken });
}

/**
 * Returns the query items
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {[*]} a flat list of result items
 */
export function response(ctx) {
	if (ctx.error) {
		util.error(ctx.error.message, ctx.error.type);
	}
	return ctx.result.items;
}
