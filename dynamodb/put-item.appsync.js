import { util } from '@aws-appsync/utils'

export function request(ctx) {
  const {
    input: { id = util.autoId(), ...values },
  } = ctx.args
  return put({ key: { id }, values })
}

export function response(ctx) {
  return ctx.result
}

function put({ key, values }) {
  return {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues(key),
    attributeValues: util.dynamodb.toMapValues(values),
  }
}
