/**
 * AppSync function: updates a new item in a DynamoDB table.
 * Find more samples and templates at https://github.com/aws-samples/aws-appsync-resolver-samples
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const {
    input: { id, ...values },
  } = ctx.args;
  const condition = { id: { attributeExists: true } };
  return update({ key: { id }, values, condition });
}

export function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return result;
}

/**
 * Request to update an item in Dynamodb. Null or empty string values are removed.
 * @param  {object} params the input parameters
 * @param  {object} params.key The key of the item in DynamoDB
 * @param  {object} params.values The values to update
 * @param  {object} [params.condition] The condition to apply to the request
 */
function update(params) {
  const { key, values, condition } = params;
  const sets = [];
  const removes = [];
  const expressionNames = {};
  const expValues = {};

  for (const [k, v] of Object.entries(values)) {
    expressionNames[`#${k}`] = k;
    if (v) {
      sets.push(`#${k} = :${k}`);
      expValues[`:${k}`] = v;
    } else {
      removes.push(`#${k}`);
    }
  }

  let expression = sets.length ? `SET ${sets.join(', ')}` : '';
  expression += removes.length ? ` REMOVE ${removes.join(', ')}` : '';

  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues(key),
    condition: getCondition(condition),
    update: {
      expression,
      expressionNames,
      expressionValues: util.dynamodb.toMapValues(expValues),
    },
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
