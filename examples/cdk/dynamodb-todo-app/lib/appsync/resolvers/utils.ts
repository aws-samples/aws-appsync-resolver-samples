import { Context, DynamoDBPutItemRequest, Key } from '@aws-appsync/utils';

/**
 * Checks for errors and returns the `result
 */
export function checkErrorsandRespond(ctx: Context) {
	if (ctx.error) {
		util.error(ctx.error.message, ctx.error.type);
	}
	return ctx.result;
}

type PutRequestType = {
	key: Key;
	values: Record<string, unknown>;
	condition: Record<string, unknown>;
};
/**
 * Helper function to create a new item
 * @returns a PutItem request
 */
export function dynamodbPutRequest({
	key,
	values,
	condition: inCondObj,
}: PutRequestType): DynamoDBPutItemRequest {
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

type UpdateRequestType = {
	key: Key;
	values: Record<string, unknown>;
	condition: Record<string, unknown>;
};
export function dynamodbUpdateRequest({ key, values, condition: inCondObj }: UpdateRequestType) {
	const sets: string[] = [];
	const removes: string[] = [];
	const expressionNames: Record<string, string> = {};
	const expValues: Record<string, unknown> = {};

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
