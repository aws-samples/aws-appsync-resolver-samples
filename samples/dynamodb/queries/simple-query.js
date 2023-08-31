import * as ddb from '@aws-appsync/utils/dynamodb';

export const request = (ctx) => ddb.query({ query: { id: { eq: ctx.args.id } } });
export const response = (ctx) => ctx.result.items;
