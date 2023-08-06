// TITLE: Paginate with fixed-size pages

import { util } from '@aws-appsync/utils';

/**
 * Paginates through search results using `from` and `size` arguments
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
	// Replace with actual values, e.g.: post
	const index = '<index>';
	return {
		operation: 'GET',
		path: `/${index}/_search`,
		params: {
			body: {
				from: ctx.args.from ?? 0,
				size: ctx.args.size ?? 50,
			},
		},
	};
}

/**
 * Returns the fetched items
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the result
 */
export function response(ctx) {
	if (ctx.error) {
		util.error(ctx.error.message, ctx.error.type);
	}
	return ctx.result.hits.hits.map((hit) => hit._source);
}
