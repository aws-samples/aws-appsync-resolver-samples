/**
 * AppSync pipeline resolver: this template can be used a started for your pipeline resolvers.
 * The template can be used as is or the request and response handlers can be updated to implement
 * before and after logic.
 * Find more samples and templates at https://github.com/aws-samples/aws-appsync-resolver-samples
 */

import { util } from '@aws-appsync/utils';

/**
 * Invoked **before** the request handler of the first AppSync function in the pipeline.
 * The resolver `request` handler allows to perform some preparation logic
 * before executing the defined functions in your pipeline.
 * @param ctx contextual information for your resolver invocation
 */
export function request(ctx) {
  return {};
}

/**
 * **Pipeline functions**
 * Between your request and response handler, the functions of your pipeline resolver will run in sequence.
 * The resolver's request handler result is made available to the first function as `ctx.prev.result`.
 * Each function's response handler result is available to the next function as `ctx.prev.result`.
 */

/**
 * Invoked **after** the response handler of the last AppSync function in the pipeline.
 * The resolver `response` handler allows to perform some final evaluation logic
 * from the output of the last function to the expected GraphQL field type.
 * @param ctx contextual information for your resolver invocation
 */
export function response(ctx) {
  return ctx.prev.result;
}
