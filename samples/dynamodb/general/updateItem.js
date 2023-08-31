import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
	const { id, ...values } = ctx.args.input;
	const condition = { id: { attributeExists: true } };
	return ddb.update({ key: { id }, update: values, condition });
}

export function response(ctx) {
	const { error, result } = ctx;
	if (error) {
		return util.error(error.message, error.type);
	}
	return result;
}
