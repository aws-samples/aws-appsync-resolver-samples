import { Context } from '@aws-appsync/utils';
import { UpdateTodoMutationVariables } from '@codegen';
import { dynamodbUpdateRequest } from './utils';
export { checkErrorsAndRespond as response } from './utils';

export function request(ctx: Context<UpdateTodoMutationVariables>) {
	const {id, ...values} = ctx.args.input;
	const condition = { id: { attributeExists: true } };
	console.log('--> update todo with requested values: ', values);
	return dynamodbUpdateRequest({ key: {id}, values, condition });
}
