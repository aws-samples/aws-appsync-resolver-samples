import { util } from '@aws-appsync/utils';

/**
 * Queries a DynamoDB table for items based on the `name` and whose city contains `city`
 * @param {import('@aws-appsync/utils').Context<{name:string; city: string}} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBQueryRequest} the request
 */
export function request(ctx) {
  const query = JSON.parse(
    util.transform.toDynamoDBConditionExpression({
      name: { eq: ctx.args.name },
    })
  );

  const filter = JSON.parse(
    util.transform.toDynamoDBFilterExpression({
      city: { contains: ctx.args.city },
    })
  );

  return {
    operation: 'Query',
    index: 'name-index',
    query,
    filter,
  };
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
