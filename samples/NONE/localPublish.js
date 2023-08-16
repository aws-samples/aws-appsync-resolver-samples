// TITLE: Locally publish a message

import { util } from '@aws-appsync/utils';

/**
 * Publishes an event localy
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {import('@aws-appsync/utils').NONERequest} the request
 */
export function request(ctx) {
	return {
		payload: {
			body: ctx.args.body,
			to: ctx.args.to,
			from: /** @type {import('@aws-appsync/utils').AppSyncIdentityCognito} */ (ctx.identity)
				.username,
			sentAt: util.time.nowISO8601(),
		},
	};
}

/**
 * Forward the payload in the `result` object
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the result
 */
export function response(ctx) {
	return ctx.result;
}
