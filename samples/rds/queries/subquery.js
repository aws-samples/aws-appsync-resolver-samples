import { select, createPgStatement as pg, agg } from '@aws-appsync/utils/rds'
export function request(ctx) {
  // First, fetch all the albums that have more than 1 genre in their tracklist
  const sub = select({
    from: 'album',
    columns: [
      'album_id',
      'title',
      'artist_id',
      { tracks: agg.count('track_id') },
      { genres: agg.countDistinct('genre_id') },
    ],
    join: [{ from: 'track', using: ['album_id'] }],
    groupBy: [1], // you can use ordinal in the groupBy close
    having: {
      genre_id: {
        countDistinct: { gt: 1 },
      },
    },
    orderBy: [{ column: 'genres', dir: 'desc' }],
  })

  // next, use the subquery and retrieve the name of the artist for those albums
  return pg(
    select({
      from: { sub }, // an identifier or an alias.
      columns: ['album_id', 'title', 'name'],
      join: [{ from: 'artist', using: ['artist_id'] }],
    }),
  )
}
