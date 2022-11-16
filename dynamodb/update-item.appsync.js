import { util } from '@aws-appsync/utils'

function before(ctx) {
  const {
    input: { id, ...values },
  } = ctx.args
  const key = { id }
  const condition = {}
  for (const name in key) {
    condition[name] = { attributeExists: true }
  }
  return update({ key, values, condition })
}

function after(ctx) {
  checkError(ctx)
  return ctx.result
}

export { after as response, before as request }

/**
 * Helper function to update an item in DynamoDB
 */
export function update({ key, values, condition: inCond }) {
  const sets = []
  const removes = []
  const expressionNames = {}
  const expValues = {}

  // iterate through the entries (key,value) of the values to be updated
  for (const [k, v] of Object.entries(values)) {
    // set the name
    expressionNames[`#${k}`] = k
    if (v) {
      // if the value exists, add it to the list to be SET
      sets.push(`#${k} = :${k}`)
      expValues[`:${k}`] = v
    } else {
      // if not, markt it to be REMOVEd
      removes.push(`#${k}`)
    }
  }

  let expression = sets.length ? `SET ${sets.join(', ')}` : ''
  expression += removes.length ? ` REMOVE ${removes.join(', ')}` : ''

  let condition = null
  if (inCond) {
    condition = JSON.parse(util.transform.toDynamoDBConditionExpression(inCond))
    if (
      condition &&
      condition.expressionValues &&
      !Object.keys(condition.expressionValues).length
    ) {
      delete condition.expressionValues
    }
  }

  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues(key),
    update: {
      expression,
      expressionNames,
      expressionValues: util.dynamodb.toMapValues(expValues),
    },
    condition,
  }
}

export function checkError(ctx) {
  const { error, result } = ctx
  if (error) {
    return util.appendError(error.message, error.type, result)
  }
}
