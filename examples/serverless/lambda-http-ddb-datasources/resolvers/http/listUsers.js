export function request() {
	return {
		method: 'GET',
		resourcePath: '/users',
	};
}

export function response(ctx) {
	const data = JSON.parse(ctx.result.body);
	return data.users;
}
