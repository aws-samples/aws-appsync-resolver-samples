// TITLE: Set up an enhanced subscription

import { util, extensions } from '@aws-appsync/utils';

/**
 * Sends an empty payload as the subscription is established
 * @param {*} ctx the context
 * @returns {import('@aws-appsync/utils').NONERequest} the request
 */
export function request(ctx) {
	//noop
	return { payload: {} };
}

/**
 * Creates an enhanced subscription
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the result
 */
export function response(ctx) {
	// the logged in user group
	const groups = ['admin', 'operators'];
	// or use the user's own groups
	// const groups = ctx.identity.groups

	// This filter sets up a subscription that is triggered when:
	// - a mutation with severity >= 7 and priority high or medium is made
	// - or a mtuation with classification "security" is made and the user belongs to the "admin" or "operators" group
	const filter = util.transform.toSubscriptionFilter({
		or: [
			{ and: [{ severity: { ge: 7 } }, { priority: { in: ['high', 'medium'] } }] },
			{ and: [{ classification: { eq: 'security' } }, { group: { in: groups } }] },
		],
	});
	console.log(filter);
	extensions.setSubscriptionFilter(filter);
	return null;
}
