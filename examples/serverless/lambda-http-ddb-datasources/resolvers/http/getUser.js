export function request(ctx) {
	return {
		method: 'GET',
		resourcePath: '/users/' + ctx.args.id,
		params: {
			headers: {
				'Content-Type': 'application/json',
			},
		},
	};
}

export function response(ctx) {
	return JSON.parse(ctx.result.body);
}
