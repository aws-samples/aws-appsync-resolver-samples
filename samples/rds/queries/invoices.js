import { util } from '@aws-appsync/utils'
import { select, toJsonObject, createPgStatement as pg } from '@aws-appsync/utils/rds'

export function request(ctx) {
  const query = select({
    columns: ['i.invoice_line_id', { track: 't.name' }, { artist: 'ar.name' }],
    from: { i: 'invoice_line' },
    join: [
      { from: { t: 'track' }, using: ['track_id'] },
      { from: { al: 'album' }, using: ['album_id'] },
      { from: { ar: 'artist' }, using: ['artist_id'] },
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
