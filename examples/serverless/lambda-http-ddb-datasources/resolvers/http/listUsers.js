export function request() {
	return {
		version: '2018-05-29',
		method: 'GET',
		resourcePath: '/users',
	};
}

export function response(ctx) {
	const data = JSON.parse(ctx.result.body);
	return data.users;
}
