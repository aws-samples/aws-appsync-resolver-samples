import { util } from '@aws-appsync/utils';

/**
 * Request to put an item in Dynamodb.
 * @param  {object} params the input parameters
 * @param  {object} params.key The key of the item in DynamoDB
 * @param  {object} params.values The values to update
 * @param  {object} [params.condtion] The condition to apply to the request
 */
function put(params) {
  const { key, values, condition } = params;
  return {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues(key),
    attributeValues: util.dynamodb.toMapValues(values),
    condition: getCondition(condition),
  };
}

/**
 * Request to update an item in Dynamodb. Null or empty string values are removed.
 * @param  {object} params the input parameters
 * @param  {object} params.key The key of the item in DynamoDB
 * @param  {object} params.values The values to update
 * @param  {object} [params.condtion] The condition to apply to the request
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

/**
 * Request to delete an item in Dynamodb
 * @param  {object} params the input parameters
 * @param  {object} params.key The key of the item in DynamoDB
 * @param  {object} [params.condtion] The condition to apply to the request
 */
function deleteItem(params) {
  const { key, condition } = params;
  return {
    operation: 'DeleteItem',
    key: util.dynamodb.toMapValues(key),
    condition: getCondition(condition),
  };
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

/**
 * Request to scan an item from Dynamodb
 * @param  {object} key The key of the item in DynamoDB
 * @param  {boolean} [consistentRead] Whether to use a consistent read or not
 */
function scan(params) {
  return {
    operation: 'Scan',
    ...params,
    filter: getFilter(params.filter),
  };
}

/**
 * Request to query an item from Dynamodb
 * @param  {object} params the input params
 */
function query(params) {
  return {
    operation: 'Query',
    ...params,
    filter: getFilter(params.filter),
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

function getFilter(inFilter) {
  if (!inFilter) return null;
  const filter = JSON.parse(util.transform.toDynamoDBFilterExpression(inFilter));
  if (filter && filter.expressionValues && !Object.keys(filter.expressionValues).length) {
    delete filter.expressionValues;
  }
  return filter;
}

export { scan, query, get, put, update, deleteItem as delete };
