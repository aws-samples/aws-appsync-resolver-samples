import { util } from '@aws-appsync/utils'
import {
  select,
  toJsonObject,
  createPgStatement as pg,
  agg,
  typeHint as th,
} from '@aws-appsync/utils/rds'

export function request(ctx) {
  const query = select({
    columns: [{ total: agg.max('total') }],
    from: { t: 'track' },
    join: [
      { from: { a: 'album' }, using: ['album_id'] },
      { from: { g: 'genre' }, using: ['genre_id'] },
      { from: { m: 'media_type' }, using: ['media_type_id'] },
    ],
  })
  return pg(query)
}

export function response(ctx) {
  const { error, result } = ctx
  if (error) {
    return util.appendError(error.message, error.type, result)
  }
  return toJsonObject(result)[0]
}
