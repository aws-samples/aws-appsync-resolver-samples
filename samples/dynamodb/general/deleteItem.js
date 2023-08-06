import { util } from '@aws-appsync/utils';

/**
 * Deletes an item with id `ctx.args.id` from the DynamoDB table
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBDeleteItemRequest} the request
 */
export function request(ctx) {
  return {
    operation: 'DeleteItem',
    key: util.dynamodb.toMapValues({ id: ctx.args.id }),
  };
}

/**
 * Returns the deleted item. Throws an error if the operation failed
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {*} the deleted item
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
}
