import { util, Context } from '@aws-appsync/utils';
import { DeleteTodoMutationVariables } from '@codegen';
export { checkErrorsandRespond as response } from './utils';

export function request(ctx: Context<DeleteTodoMutationVariables>) {
	const { input: key } = ctx.arguments;
	return {
		operation: 'DeleteItem',
		key: util.dynamodb.toMapValues(key),
	};
}
