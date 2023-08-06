import { util } from '@aws-appsync/utils';

/**
 * Triggers the pipeline
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns an object that is send to the first function
 */
export function request(ctx) {
	return {};
}

/**
 * Simply forwards the result
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the result from the last function in the pipeline
 */
export const response = (ctx) => ctx.prev.result;
