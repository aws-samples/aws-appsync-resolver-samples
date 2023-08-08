import { util, Context } from '@aws-appsync/utils';
import { CreateTodoMutationVariables } from '@codegen';
import { dynamodbUpdateRequest } from './utils';
export { checkErrorsandRespond as response } from './utils';

export function request(ctx: Context<CreateTodoMutationVariables>) {
	const { input: values } = ctx.arguments;
	const key = { id: util.autoId() };
	const condition = { id: { attributeExists: false } };
	console.log('--> create todo with requested values: ', values);
	return dynamodbUpdateRequest({ key, values, condition });
}
