import { util } from '@aws-appsync/utils';

/**
 * Sends a publish request to the SNS topic
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns the request
 */
export function request(ctx) {
	const TOPIC_ARN = '<your:topic:arn>';
	const { input: values } = ctx.args;
	return publishToSNSRequest(TOPIC_ARN, values);
}

/**
 * Process the publish response
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {string} the publish response
 */
export function response(ctx) {
	const {
		result: { statusCode, body },
	} = ctx;
	if (statusCode === 200) {
		// if response is 200
		// parse the xml response
		return util.xml.toMap(body).PublishResponse.PublishResult;
	}

	// if response is not 200, append the response to error block.
	util.appendError(body, `${statusCode}`);
}

/**
 * Sends a publish request
 * @param {string} topicArn SNS topic ARN
 * @param {*} values values to publish
 * @returns {import('@aws-appsync/utils').HTTPRequest} the request
 */
function publishToSNSRequest(topicArn, values) {
	const arn = util.urlEncode(topicArn);
	const tmp = JSON.stringify(values);
	const message = util.urlEncode(tmp);
	const Body = {
		Action: 'Publish',
		Version: '2010-03-31',
		topicArn: arn,
		Message: message,
	};
	const body = Object.entries(Body)
		.map(([k, v]) => `${k}=${v}`)
		.join('&');

	return fetch('/', {
		method: 'POST',
		body,
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
		},
	});
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
	const { method = 'GET', headers, body: _body, query } = options;
	const body = typeof _body === 'object' ? JSON.stringify(_body) : _body;
	return {
		resourcePath,
		method,
		params: { headers, query, body },
	};
}
