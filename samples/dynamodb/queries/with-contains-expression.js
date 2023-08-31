import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

/**
 * Queries a DynamoDB table for items based on the `id` and that contain the `tag`
 * @param {import('@aws-appsync/utils').Context<{id: string; tag:string}>} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBQueryRequest} the request
 */
export function request(ctx) {
	return ddb.query({
		query: { id: { eq: ctx.args.id } },
		filter: { tags: { contains: ctx.args.tag } },
	});
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
