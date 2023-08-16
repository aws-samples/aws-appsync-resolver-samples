// TITLE: Simple search
// (default for OS Function)

import { util } from '@aws-appsync/utils';

/**
 * Searches for documents by using an input term
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
				from: 0,
				size: 50,
				query: {
					term: {
						'<field>': ctx.args.field, // replace with your field
					},
				},
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
