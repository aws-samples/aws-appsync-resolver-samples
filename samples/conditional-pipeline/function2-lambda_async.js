import { util, runtime } from '@aws-appsync/utils';

/**
 * Sends a request to a Lambda function. Passes all information about the request from the `info` object.
 * @param {import('@aws-appsync/utils').Context} ctx the context
 */
export function request(ctx) {
	if (ctx.stash.useFirstDataSource === true) {
		// If we already invoked the first resolver, skip this one
		// Make sure to return result of previous function since we skip the current function
		runtime.earlyReturn(ctx.prev.result);
	}
	return {
		operation: 'Invoke',
		invocationType: 'Event', // Invoke lambda async
		payload: {
			fieldName: ctx.info.fieldName,
			parentTypeName: ctx.info.parentTypeName,
			variables: ctx.info.variables,
			selectionSetList: ctx.info.selectionSetList,
			selectionSetGraphQL: ctx.info.selectionSetGraphQL,
		},
	};
}

/**
 * Process a Lambda function response
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the Lambda function response
 */
export function response(ctx) {
	const { result, error } = ctx;
	if (error) {
		util.error(error.message, error.type, result);
	}

	ctx.stash.ds2resp = result;

	return result;
}
