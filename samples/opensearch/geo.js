// TITLE: Get all documents within a 20 mile radius

import { util } from '@aws-appsync/utils';

/**
 * Searches for all documents using Geodistance aggregation
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
				query: {
					filtered: {
						query: { match_all: {} },
						filter: {
							geo_distance: {
								distance: '20mi',
								location: { lat: 47.6205, lon: 122.3493 },
							},
						},
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
