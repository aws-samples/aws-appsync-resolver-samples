import { util } from '@aws-appsync/utils';
import * as dynamodb from '../../../utils/dynamodb';
import * as http from '../../../utils/http';

export function request(ctx) {
  const { input: values } = ctx.arguments;
  // const key = { id: util.autoId() };
  // const condition = { id: { attributeExists: false } };
  // return dynamodb.update({ key, values, condition });
  return http.publishToSNSRequest('TOPIC_ARN', values);
}

export function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
