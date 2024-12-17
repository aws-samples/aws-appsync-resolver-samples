import { util } from '@aws-appsync/utils'
import { sql, toJsonObject, createPgStatement as pg } from '@aws-appsync/utils/rds'

export function request(ctx) {
  return pg(sql`select count(*) from album where artist_id = ${ctx.args.artist_id}`)
}

export function response(ctx) {
  const { error, result } = ctx
  if (error) {
    return util.appendError(error.message, error.type, result)
  }
  return toJsonObject(result)[0][0]
}
