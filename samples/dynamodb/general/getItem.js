import * as ddb from '@aws-appsync/utils/dynamodb';

export const request = (ctx) => ddb.get({ key: { id: ctx.args.id } });
export const response = (ctx) => ctx.result;
