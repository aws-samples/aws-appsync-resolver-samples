export function request(ctx) {
	return {
		operation: 'Invoke',
		payload: { field: ctx.info.fieldName },
	};
}

export function response(ctx) {
	return ctx.result;
}
