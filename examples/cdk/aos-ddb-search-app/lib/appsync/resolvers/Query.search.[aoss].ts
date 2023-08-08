import { Context, OpenSearchQueryObject } from '@aws-appsync/utils';
import { aossSearch } from './utils';
import { Todo } from '@codegen';

export function request(ctx: Context) {
	const query: OpenSearchQueryObject<Todo> = {
		id: {},
	};
	// const query = {
	// 	query: {
	// 		match: {
	// 			title: {
	// 				query: 'The Outsider',
	// 			},
	// 		},
	// 	},
	// };
	return aossSearch({ index: 'todos', body: query });
}

export function response(ctx: Context) {
	if (ctx.error) {
		util.error(ctx.error.message, ctx.error.type);
	}
	const result = JSON.parse(ctx.result.body);
	console.log(result);
	return result.hits.hits.map((hit) => hit._source);
}
