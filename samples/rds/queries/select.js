import { util } from '@aws-appsync/utils'
import { select, toJsonObject, createPgStatement as pg, agg } from '@aws-appsync/utils/rds'

export function request(ctx) {
  const query = select({
    from: 'album',
    columns: ['name', { count: agg.count('*') }],
    join: [{ from: 'artist', using: ['artist_id'] }],
    groupBy: ['name'],
    having: {
      album_id: { count: { gt: 1 } },
    },
    orderBy: [{ column: 'name' }],
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
