import { Context } from '@aws-appsync/utils';
import { Result, ListTodosQuery, ListTodosQueryVariables } from '@codegen';
/**
 * Scans the DynamoDB datasource. Scans up to the provided `limit` and stards from the provided `NextToken` (optional).
 */
export function request(ctx: Context<ListTodosQueryVariables>) {
	const { limit = 10, nextToken } = ctx.args;
	return { operation: 'Scan', limit, nextToken };
}

/**
 * Returns the scanned items
 */
export function response(ctx: Context): Result<ListTodosQuery['listTodos']> {
	const { items = [], nextToken } = ctx.result;
	return { items, nextToken };
}
