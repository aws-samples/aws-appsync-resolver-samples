import { util } from '@aws-appsync/utils';

export function request(ctx) {
	const {
		input: { id, ...values },
	} = ctx.args;
	const condition = { id: { attributeExists: true } };
	return dynamodbUpdateRequest({ key: { id }, values, condition });
}

export function response(ctx) {
	const { error, result } = ctx;
	if (error) {
		return util.appendError(error.message, error.type, result);
	}
	return result;
}

function dynamodbUpdateRequest({ key, values, condition: inCondObj }) {
	const sets = [];
	const removes = [];
	const expressionNames = {};
	const expValues = {};

	for (const [k, v] of Object.entries(values)) {
		expressionNames[`#${k}`] = k;
		if (v) {
			sets.push(`#${k} = :${k}`);
			expValues[`:${k}`] = v;
		} else {
			removes.push(`#${k}`);
		}
	}

	console.log(`SET: ${sets.length}, REMOVE: ${removes.length}`);

	let expression = sets.length ? `SET ${sets.join(', ')}` : '';
	expression += removes.length ? ` REMOVE ${removes.join(', ')}` : '';

	console.log('update expression', expression);

	const condition = JSON.parse(util.transform.toDynamoDBConditionExpression(inCondObj));

	if (condition.expressionValues && !Object.keys(condition.expressionValues).length) {
		delete condition.expressionValues;
	}

	return {
		operation: 'UpdateItem',
		key: util.dynamodb.toMapValues(key),
		condition,
		update: {
			expression,
			expressionNames,
			expressionValues: util.dynamodb.toMapValues(expValues),
		},
	};
}
