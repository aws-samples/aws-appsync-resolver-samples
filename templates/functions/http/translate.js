/**
 * AppSync function: translates a message with AWS Translate.
 * Find more samples and templates at https://github.com/aws-samples/aws-appsync-resolver-samples
 */

import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { text, source = 'EN', target = 'FR' } = ctx.args;
  return awsTranslateRequest(text, source, target);
}

export function response(ctx) {
  const { result } = ctx;
  if (result.statusCode !== 200) {
    return util.appendError(result.body, `${result.statusCode}`);
  }

  const body = JSON.parse(result.body);
  const { TranslatedText: text } = body;
  return text;
}

function awsTranslateRequest(text, source, target) {
  return {
    method: 'POST',
    resourcePath: '/',
    params: {
      headers: {
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'AWSShineFrontendService_20170701.TranslateText',
      },
      body: JSON.stringify({ Text: text, SourceLanguageCode: source, TargetLanguageCode: target }),
    },
  };
}
