import { util } from '@aws-appsync/utils';

/**
 * Sends a tranlsate request to the Translate service
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns the request
 */
export function request(ctx) {
	const { text = 'Hello World!', source = 'EN', target = 'FR' } = ctx.args;
	return awsTranslateRequest(text, source, target);
}

/**
 * Process the translate response
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {string} the translated text
 */
export function response(ctx) {
	const { result } = ctx;
	if (result.statusCode !== 200) {
		return util.appendError(result.body, `${result.statusCode}`);
	}
	const body = JSON.parse(result.body);
	return body.TranslatedText;
}

/**
 * Sends a request to the Translate service
 * @param {string} text text to translate
 * @param {string} source the source language code
 * @param {string} target the target language code
 * @returns {import('@aws-appsync/utils').HTTPRequest} the request
 */
function awsTranslateRequest(text, source, target) {
	return fetch('/', {
		method: 'POST',
		headers: {
			'content-type': 'application/x-amz-json-1.1',
			'x-amz-target': 'AWSShineFrontendService_20170701.TranslateText',
		},
		body: { Text: text, SourceLanguageCode: source, TargetLanguageCode: target },
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
