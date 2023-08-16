import { util } from '@aws-appsync/utils';

/**
 * Gets items from the DynamoDB tables in batches with the provided `id` keys
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBBatchPutItemRequest} the request
 */
export function request(ctx) {
  return {
    operation: 'BatchPutItem',
    tables: {
      Posts: ctx.args.posts.map((post) => util.dynamodb.toMapValues(post)),
    },
  };
}

/**
 * Returns the BatchPutItem table results
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {[*]} the items
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result.data.Posts;
}
