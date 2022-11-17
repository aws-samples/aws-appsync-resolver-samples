/**
 * AppSync function: gets an item in a DynamoDB table.
 * Find more samples and templates at https://github.com/aws-samples/aws-appsync-resolver-samples
 */

import { util } from '@aws-appsync/utils';

/**
 * Request a single item from the attached DynamoDB table datasource
 * @param ctx the request context
 */
export function request(ctx) {
  // retrieve key from the arguments
  // this can be a primary and sort key
  const { id } = ctx.args;
  return get({ id });
}

/**
 * Returns the result
 * @param ctx the request context
 */
export function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}

/**
 * Request to get an item from Dynamodb
 * @param  {object} key The key of the item in DynamoDB
 * @param  {boolean} [consistentRead] Whether to use a consistent read or not
 */
function get(key, consistentRead = false) {
  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues(key),
    consistentRead,
  };
}
