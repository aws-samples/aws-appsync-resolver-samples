import { util } from '@aws-appsync/utils';

/**
 * Queries a DynamoDB table for items created after a specified data (`createdAt`)
 * @param {import('@aws-appsync/utils').Context<{id: string; createdAt: string}>} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBQueryRequest} the request
 */
export function request(ctx) {
  const { id, createdAt } = ctx.args;
  const query = JSON.parse(
    util.transform.toDynamoDBConditionExpression({
      id: { eq: id },
      createdAt: { gt: createdAt },
    })
  );
  return { operation: 'Query', query };
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
