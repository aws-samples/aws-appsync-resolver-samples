import { util, runtime } from '@aws-appsync/utils';
import { select, createPgStatement } from '@aws-appsync/utils/rds';

/**
 * Sends a request to a Lambda function. Passes all information about the request from the `info` object.
 * @param {import('@aws-appsync/utils').Context} ctx the context
 */
export function request(ctx) {
	if (ctx.stash.useFirstDataSource === false) {
		// if the condition is to not use first resolver, skip it
		runtime.earlyReturn({});
	}

	return createPgStatement(select({ table: 'persons' }));
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

	ctx.stash.ds1resp = result;
	return result;
}
