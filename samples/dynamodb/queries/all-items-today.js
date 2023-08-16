import { util } from '@aws-appsync/utils';

/**
 * Queries a DynamoDB table and returns items created `today`
 * @param {import('@aws-appsync/utils').Context<{id: string}>} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBQueryRequest} the request
 */
export function request(ctx) {
  const today = util.time.nowISO8601().substring(0, 10);
  const query = JSON.parse(
    util.transform.toDynamoDBConditionExpression({
      id: { eq: ctx.args.id },
      createdAt: { beginsWith: today },
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
