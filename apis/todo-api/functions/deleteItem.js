/**
 * AppSync function: deletes an item in a DynamoDB table.
 * Find more samples and templates at https://github.com/aws-samples/aws-appsync-resolver-samples
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { id } = ctx.args.input;
  return dynamodbDeleteRequest({ id });
}

export function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}

function dynamodbDeleteRequest(key) {
  return {
    operation: 'DeleteItem',
    key: util.dynamodb.toMapValues(key),
  };
}
