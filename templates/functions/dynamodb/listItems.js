/**
 * AppSync function: lists items in a DynamoDB table.
 * Find more samples and templates at https://github.com/aws-samples/aws-appsync-resolver-samples
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { filter, limit = 20, nextToken } = ctx.args;
  return scan({ filter, limit, nextToken });
}

export function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  const { items = [], nextToken } = result;
  return { items, nextToken };
}

/**
 * Request to scan an item from Dynamodb
 * @param  {object} params the request parameters
 */
function scan(params) {
  return {
    operation: 'Scan',
    ...params,
    filter: getFilter(params.filter),
  };
}

function getFilter(inFilter) {
  if (!inFilter) return null;
  const filter = JSON.parse(util.transform.toDynamoDBFilterExpression(inFilter));
  if (filter && filter.expressionValues && !Object.keys(filter.expressionValues).length) {
    delete filter.expressionValues;
  }
  return filter;
}
