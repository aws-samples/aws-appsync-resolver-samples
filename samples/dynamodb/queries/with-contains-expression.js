import { util } from '@aws-appsync/utils';

/**
 * Queries a DynamoDB table for items based on the `id` and that contain the `tag`
 * @param {import('@aws-appsync/utils').Context<{id: string; tag:string}>} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBQueryRequest} the request
 */
export function request(ctx) {
  const query = JSON.parse(
    util.transform.toDynamoDBConditionExpression({
      id: { eq: ctx.args.id },
    })
  );

  const filter = JSON.parse(
    util.transform.toDynamoDBFilterExpression({
      tags: { contains: ctx.args.tag },
    })
  );

  return { operation: 'Query', query, filter };
}

/**
 * Returns the query items
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {[*]} a flat list of result items
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result.items;
}
