/**
 * AppSync function: publishes a message to an SNS topic.
 * Find more samples and templates at https://github.com/aws-samples/aws-appsync-resolver-samples
 */

import { util } from '@aws-appsync/utils';

/**
 * Creates a new item in a DynamoDB table
 * @param ctx contextual information about the request
 */
export function request(ctx) {
  const TOPIC_ARN = '<your:topic:arn>';
  const { input: values } = ctx.arguments;
  return publishToSNSRequest(TOPIC_ARN, values);
}

export function response(result) {
  if (result.statusCode === 200) {
    // if response is 200
    // Because the response is of type XML, we are going to convert
    // the result body as a map and only get the User object.
    return util.xml.toMap(result.body).PublishResponse.PublishResult;
  }
  // if response is not 200, append the response to error block.
  util.appendError(result.body, `${result.statusCode}`);
}

function publishToSNSRequest(topicArn, values) {
  const arn = util.urlEncode(topicArn);
  const tmp = JSON.stringify(values);
  const message = util.urlEncode(tmp);
  let body = `Action=Publish&Version=2010-03-31&TopicArn=${arn}`;
  body += `$&Message=${message}`;
  return {
    method: 'POST',
    resourcePath: '/',
    params: {
      body,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    },
  };
}
