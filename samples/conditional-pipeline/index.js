/**
 * Starts the resolver execution
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the return value sent to the first AppSync function
 */
export function request(ctx) {
	// check the number of arguments and set a valude in the stash that we can conditionally use later
	if (Object.keys(ctx.args).length > 5) {
		ctx.stash.useFirstDataSource = true;
	} else {
		ctx.stash.useFirstDataSource = false;
	}

	return {};
}

/**
 * Returns the resolver result
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the return value of the last AppSync function response handler
 */
export function response(ctx) {
	return ctx.prev.result;
}
