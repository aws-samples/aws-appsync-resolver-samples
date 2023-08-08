import { Context } from '@aws-appsync/utils';
import { CreateIndexMutationVariables } from '@codegen';
import { FetchOptions, aossCreateIndex } from './utils';

export function request(ctx: Context<CreateIndexMutationVariables>) {
	const index = ctx.args.index;
	const settings = {
		settings: {
			index: {
				number_of_shards: 4,
				number_of_replicas: 3,
			},
		},
	};
	const options: FetchOptions = {
		method: 'PUT',
		body: settings,
	};
	return aossCreateIndex(index, options);
}

export function response(ctx: Context) {
	return ctx.result;
}
