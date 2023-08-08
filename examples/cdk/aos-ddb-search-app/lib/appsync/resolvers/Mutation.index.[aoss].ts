import { Context } from '@aws-appsync/utils';
import { IndexMutationVariables } from '@codegen';
import { aossIndexApi } from './utils';

export function request(ctx: Context<IndexMutationVariables>) {
	return aossIndexApi<IndexMutationVariables['input']>({
		id: ctx.args.input.id,
		index: 'todos',
		body: ctx.args.input,
	});
}

export function response(ctx: Context) {
	return ctx.result;
}
