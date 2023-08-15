import { util } from '@aws-appsync/utils';

export function request(ctx) {
	const { input: values } = ctx.arguments;
	const key = { id: util.autoId() };
	const condition = { id: { attributeExists: false } };
	console.log('--> create todo with requested values: ', values);
	return dynamodbPutRequest({ key, values, condition });
}

export function response(ctx) {
	const { error, result } = ctx;
	if (error) {
		return util.appendError(error.message, error.type, result);
	}
	return ctx.result;
}

/**
 * Helper function to create a new item
 * @returns a PutItem request
 */
function dynamodbPutRequest({ key, values, condition: inCondObj }) {
	const condition = JSON.parse(util.transform.toDynamoDBConditionExpression(inCondObj));
	if (condition.expressionValues && !Object.keys(condition.expressionValues).length) {
		delete condition.expressionValues;
	}
	return {
		operation: 'PutItem',
		key: util.dynamodb.toMapValues(key),
		attributeValues: util.dynamodb.toMapValues(values),
		condition,
	};
}
