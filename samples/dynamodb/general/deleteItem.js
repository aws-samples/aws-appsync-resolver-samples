import * as ddb from '@aws-appsync/utils/dynamodb';

export const request = (ctx) => ddb.remove({ key: { id: ctx.args.id } });
export const response = (ctx) => ctx.result;
