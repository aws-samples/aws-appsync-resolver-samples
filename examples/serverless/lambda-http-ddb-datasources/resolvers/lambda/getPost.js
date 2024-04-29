export function request(ctx) {
	return {
		operation: 'Invoke',
		payload: { field: ctx.info.fieldName, arguments: ctx.args },
	};
}

export function response(ctx) {
	return ctx.result;
}
