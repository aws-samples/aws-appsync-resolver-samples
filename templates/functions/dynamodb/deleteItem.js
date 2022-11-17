/**
 * AppSync function: deletes an item in a DynamoDB table.
 * Find more samples and templates at https://github.com/aws-samples/aws-appsync-resolver-samples
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { id } = ctx.args;
  return deleteItem({ key: { id } });
}

export function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}

/**
 * Request to delete an item in Dynamodb
 * @param  {object} params the input parameters
 * @param  {object} params.key The key of the item in DynamoDB
 * @param  {object} [params.condition] The condition to apply to the request
 */
function deleteItem(params) {
  const { key, condition } = params;
  return {
    operation: 'DeleteItem',
    key: util.dynamodb.toMapValues(key),
    condition: getCondition(condition),
  };
}

function getCondition(inCondObj) {
  if (!inCondObj) return null;
  const condition = JSON.parse(util.transform.toDynamoDBConditionExpression(inCondObj));
  if (condition && condition.expressionValues && !Object.keys(condition.expressionValues).length) {
    delete condition.expressionValues;
  }
  return condition;
}
