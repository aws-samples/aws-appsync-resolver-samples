import { Context } from '@aws-appsync/utils';
import { CreateIndexMutationVariables } from '../codegen';
import { createIndex } from './utils';

export function request(ctx: Context<CreateIndexMutationVariables>) {
	const index = ctx.args.index;
	// optional settings
	const body = {
		settings: {
			index: { number_of_shards: 4, number_of_replicas: 3 },
		},
	};
	return createIndex({ index, body });
}

export function response(ctx: Context) {
	const body = JSON.parse(ctx.result.body);
	if (ctx.result.statusCode !== 200) {
		util.error(body.error?.reason, body.error?.type, body);
	}
	return body;
}
