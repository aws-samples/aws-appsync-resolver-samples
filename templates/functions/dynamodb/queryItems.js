/**
 * AppSync function: queries items on a given index in a DynamoDB table.
 * Find more samples and templates at https://github.com/aws-samples/aws-appsync-resolver-samples
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  // owner is the primary key used in this example
  const { owner, first: limit = 20, after: nextToken, filter } = ctx.args;
  // we prepare an expression that will return all items belonging to the owner
  const indexQuery = { owner: { eq: owner } };
  // the specific index we want to query
  const index = 'owner-index';
  return query({ query: indexQuery, index, limit, nextToken, filter });
}

export function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return result;
}

/**
 * Request to query an item from Dynamodb
 * @param  {object} params the request parameters
 */
function query(params) {
  const query = getFilter(params.query);
  const filter = getFilter(params.filter);
  return {
    operation: 'Query',
    ...params,
    filter,
    query,
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
