import { util } from '@aws-appsync/utils';

/**
 * Sends a GET request to retrieve a user's inforrmation
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns the request
 */
export function request(ctx) {
	return fetch(ctx.args.path, {
		// headers: util.http.copyHeaders(ctx.request.headers),
		body: ctx.args.body, // can include in the body
		query: ctx.args.query, // or in the query string
	});
}

/**
 * Process the HTTP response
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the publish response
 */
export function response(ctx) {
	const { statusCode, body } = ctx.result;
	// if response is 200, return the response
	if (statusCode === 200) {
		return body;
	}
	// if response is not 200, append the response to error block.
	util.appendError(body, statusCode);
}

/**
 * Sends an HTTP request
 * @param {string} resourcePath path of the request
 * @param {Object} [options] values to publish
 * @param {'PUT' | 'POST' | 'GET' | 'DELETE' | 'PATCH'} [options.method] the request method
 * @param {Object.<string, string>} [options.headers] the request headers
 * @param {string | Object.<string, any>} [options.body] the request body
 * @param {Object.<string, string>} [options.query] Key-value pairs that specify the query string
 * @returns {import('@aws-appsync/utils').HTTPRequest} the request
 */
function fetch(resourcePath, options) {
	const { method = 'GET', headers, body: _body, query = {} } = options;
	const [path, params] = resourcePath.split('?');
	console.log('params > ', params);
	if (params && params.length) {
		params.split('&').forEach((param) => {
			console.log('param > ', param);
			const [key, value] = param.split('=');
			query[key] = value;
		});
	}
	const body = typeof _body === 'object' ? JSON.stringify(_body) : _body;
	return {
		resourcePath: path,
		method,
		params: { headers, query, body },
	};
}
