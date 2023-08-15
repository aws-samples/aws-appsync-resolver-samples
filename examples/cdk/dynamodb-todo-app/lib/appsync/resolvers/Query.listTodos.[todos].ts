import { Context } from '@aws-appsync/utils';
import { Result, ListTodosQuery, ListTodosQueryVariables } from '../codegen';

export function request(ctx: Context<ListTodosQueryVariables>) {
	const { limit = 10, nextToken } = ctx.args;
	return { operation: 'Scan', limit, nextToken };
}

export function response(ctx: Context): Result<ListTodosQuery['listTodos']> {
	const { items = [], nextToken } = ctx.result;
	return { items, nextToken };
}
