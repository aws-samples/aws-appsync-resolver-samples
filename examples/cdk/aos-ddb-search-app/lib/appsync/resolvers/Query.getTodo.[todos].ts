import { util, Context } from '@aws-appsync/utils';
import { GetTodoQueryVariables } from '@codegen';

/**
 * Sends a Get request for the item
 */
export function request(ctx: Context<GetTodoQueryVariables>) {
	return {
		operation: 'GetItem',
		key: util.dynamodb.toMapValues({ id: ctx.args.id }),
	};
}

/**
 * Returns the fetched DynamoDB item
 */
export const response = (ctx: Context) => ctx.result;
