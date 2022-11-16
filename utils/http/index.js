import { util } from '@aws-appsync/utils';

export function publishToSNSRequest(topicArn, values) {
  const arn = util.urlEncode(topicArn);
  const message = util.urlEncode(JSON.stringify(values));
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

export function publishToSNSResponse(result) {
  if (result.statusCode === 200) {
    // if response is 200
    // Because the response is of type XML, we are going to convert
    // the result body as a map and only get the User object.
    return util.xml.toMap(result.body).PublishResponse.PublishResult;
  }
  // if response is not 200, append the response to error block.
  util.appendError(result.body, `${result.statusCode}`);
}
