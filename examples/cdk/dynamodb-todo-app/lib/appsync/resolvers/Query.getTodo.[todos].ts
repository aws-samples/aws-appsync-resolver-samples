import { util, Context } from '@aws-appsync/utils';
import { GetTodoQueryVariables } from '@codegen';

export function request(ctx: Context<GetTodoQueryVariables>) {
	return {
		operation: 'GetItem',
		key: util.dynamodb.toMapValues({ id: ctx.args.id }),
	};
}

export const response = (ctx: Context) => ctx.result;
