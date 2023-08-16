/**
 * AppSync function: Fetches an item in a DynamoDB table.
 * Find more samples and templates at https://github.com/aws-samples/aws-appsync-resolver-samples
 */

import { util } from '@aws-appsync/utils';

/**
 * Request a single item from the attached DynamoDB table datasource
 * @param ctx the request context
 */
export function request(ctx) {
  const { id } = ctx.args;
  return dynamoDBGetItemRequest({ id });
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
 * A helper function to get a DynamoDB it
 * @param key a set of keys for the item
 * @returns a DynamoDB Get request
 */
function dynamoDBGetItemRequest(key) {
  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues(key),
  };
}
