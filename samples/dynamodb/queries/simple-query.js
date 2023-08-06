import { util } from '@aws-appsync/utils';

/**
 * Queries a DynamoDB table for items based on the `id`
 * @param {import('@aws-appsync/utils').Context<{id: string}>} ctx the context
 * @returns {import('@aws-appsync/utils').DynamoDBQueryRequest} the request
 */
export function request(ctx) {
  return {
    operation: 'Query',
    query: {
      expression: '#id = :id',
      expressionNames: util.dynamodb.toMapValues({ '#id': 'id' }),
      expressionValues: util.dynamodb.toMapValues({ ':id': ctx.args.id }),
    },
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
