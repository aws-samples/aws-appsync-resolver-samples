// apis/todo-api/functions/scratch.js
import { util as util3 } from "@aws-appsync/utils";

// utils/dynamodb/index.js
import { util } from "@aws-appsync/utils";

// utils/http/index.js
import { util as util2 } from "@aws-appsync/utils";
function publishToSNSRequest(topicArn, values) {
  const arn = util2.urlEncode(topicArn);
  const message = util2.urlEncode(JSON.stringify(values));
  let body = `Action=Publish&Version=2010-03-31&TopicArn=${arn}`;
  body += `$&Message=${message}`;
  return {
    method: "POST",
    resourcePath: "/",
    params: {
      body,
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      }
    }
  };
}

// apis/todo-api/functions/scratch.js
function request(ctx) {
  const { input: values } = ctx.arguments;
  return publishToSNSRequest("TOPIC_ARN", values);
}
function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    return util3.appendError(error.message, error.type, result);
  }
  return ctx.result;
}
export {
  request,
  response
};
