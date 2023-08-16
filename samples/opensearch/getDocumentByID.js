// TITLE: Get document by id

import { util } from '@aws-appsync/utils';

/**
 * Gets a document by `id`
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
	// Replace with actual values, e.g.: post
	const index = '<index>';
	return {
		operation: 'GET',
		path: `/${index}/_doc/${ctx.args.id}`,
	};
}

/**
 * Returns the fetched item
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the result
 */
export function response(ctx) {
	if (ctx.error) {
		util.error(ctx.error.message, ctx.error.type);
	}
	return ctx.result['_source'];
}
