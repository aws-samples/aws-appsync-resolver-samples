import { util } from '@aws-appsync/utils';

/**
 * Sends an event to Event Bridge
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the request
 */
export function request(ctx) {
	return {
		operation: 'PutEvents',
		events: [
			{
				source: ctx.source,
				detail: {
					key1: [1, 2, 3, 4],
					key2: 'strval',
				},
				detailType: 'sampleDetailType',
				resources: ['Resouce1', 'Resource2'],
				time: util.time.nowISO8601(),
			},
		],
	};
}

/**
 * Process the response
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the EventBridge response
 */
export function response(ctx) {
	return ctx.result;
}
