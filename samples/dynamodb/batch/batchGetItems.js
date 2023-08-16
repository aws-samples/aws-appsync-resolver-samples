import { util } from '@aws-appsync/utils';

/**
 * Gets items from the DynamoDB tables in batches with the provided `id` keys
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBBatchGetItemRequest} the request
 */
export function request(ctx) {
  return {
    operation: 'BatchGetItem',
    tables: {
      Posts: {
        keys: ctx.args.ids.map((id) => util.dynamodb.toMapValues({ id })),
        consistentRead: true,
      },
    },
  };
}

/**
 * Returns the BatchGetItem table items
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {[*]} the items
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result.data.Posts;
}
