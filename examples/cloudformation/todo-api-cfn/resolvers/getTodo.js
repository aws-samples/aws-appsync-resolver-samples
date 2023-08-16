import { util } from '@aws-appsync/utils';

export function request(ctx) {
	return {
		operation: 'GetItem',
		key: util.dynamodb.toMapValues({ id: ctx.args.id }),
	};
}

export function response(ctx) {
	const { error, result } = ctx;
	if (error) {
		return util.appendError(error.message, error.type, result);
	}
	return ctx.result;
}
