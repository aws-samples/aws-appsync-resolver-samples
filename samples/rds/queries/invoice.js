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
    from: { i: 'invoice' },
    columns: [agg.count('i.invoice_id'), agg.sum('i.total')],
    where: {
      invoice_date: {
        between: [th.TIMESTAMP('2021-01-01 00:00:00'), th.TIMESTAMP('2022-12-31 00:00:00')],
      },
    },
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
