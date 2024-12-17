import { util } from '@aws-appsync/utils'
import {
  select,
  toJsonObject,
  createPgStatement as pg,
  agg,
  typeHint as th,
} from '@aws-appsync/utils/rds'

// -- 16. Provide a query that shows all the Tracks, but displays no IDs. The resultant table should include the Album name, Media type and Genre.
export function request(ctx) {
  const query = select({
    columns: [
      { track: 't.name' },
      't.composer',
      't.milliseconds',
      't.bytes',
      't.unit_price',
      { album: 'a.title' },
      { genre: 'g.name' },
      { 'media type': 'm.name' },
    ],
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
