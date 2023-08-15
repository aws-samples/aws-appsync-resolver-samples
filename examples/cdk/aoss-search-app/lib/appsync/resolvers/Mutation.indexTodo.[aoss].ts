import { Context } from '@aws-appsync/utils';
import { IndexTodoMutationVariables } from '../codegen';
import { indexItem } from './utils';

export function request(ctx: Context<IndexTodoMutationVariables>) {
	return indexItem<IndexTodoMutationVariables['input']>({
		id: ctx.args.input.id,
		index: 'todos',
		body: ctx.args.input,
	});
}

export function response(ctx: Context) {
	const body = JSON.parse(ctx.result.body);
	if (!`${ctx.result.statusCode}`.startsWith('2')) {
		util.error(body.error?.reason, body.error?.type, body);
	}
	return body;
}
