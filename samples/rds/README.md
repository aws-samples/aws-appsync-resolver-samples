
# AppSyncJS built-in module for Amazon RDS

<!--toc:start-->
- [AppSyncJS built-in module for Amazon RDS](#appsyncjs-built-in-module-for-amazon-rds)
  - [Functions](#functions)
    - [sql](#sql)
    - [Select](#select)
      - [Basic use](#basic-use)
      - [Specifying columns](#specifying-columns)
      - [Limits and offsets](#limits-and-offsets)
      - [Order By](#order-by)
      - [Filters](#filters)
      - [Joins](#joins)
      - [Aggregates](#aggregates)
      - [More on aliases](#more-on-aliases)
      - [Subqueries](#subqueries)
    - [Insert](#insert)
      - [Single item insertions](#single-item-insertions)
      - [MySQL use case](#mysql-use-case)
      - [Postgres use case](#postgres-use-case)
    - [Update](#update)
    - [Casting](#casting)
<!--toc:end-->

AppSync's built-in module for Amazon RDS module provides an enhanced experience for interacting with Amazon Aurora databases configured with the Amazon RDS Data API. The module is imported using `@aws-appsync/utils/rds`:

```js
import * as rds from '@aws-appsync/utils/rds';
```

Functions can also be imported individually. For instance, the import below uses sql:

```js
import { sql } from '@aws-appsync/utils/rds';
```

The example in this folder are based on the `Chinook_PostgreSql.sql` database schema that you can find [here](https://github.com/lerocha/chinook-database/blob/master/ChinookDatabase/DataSources/Chinook_PostgreSql.sql). You can load this schema in your database and create an AppSync GraphQL API from the definition  from the AppSync console. Learn more about the [introspection feature](https://docs.aws.amazon.com/appsync/latest/devguide/rds-introspection.html#using-introspection-console).

## Functions

You can use the AWS AppSync RDS module's utility helpers to interact with your database.

### sql

The `sql` tag template utility is your go-to tool to write SQL queries directly. Use this utility when the provided utilities below are not enough to create the statements that you need. You can also use the `sql` operator to customize certain fields of the `select`, `insert`, `update`, and `remove` utilities.

```js
import { sql, createPgStatement as pg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  return pg(sql`select count(*) from album where artist_id = ${ctx.args.artist_id}`)
}
```

This will generate a query and automatically map dynamic values to placeholders. This approach is safer than writing queries directly and helps prevent potential SQL Injection vulnerabilities.

```JSON
{
  "statements": [
    "select count(*) from album where artist_id = :P0"
  ],
  "variableMap": {
    ":P0": 134
  },
  "variableTypeHintMap": {}
}
```

### Select

the select utility creates a `select` statement to query your relational database.

#### Basic use

In its basic form, you can specify the table you want to query:

```js
import { select, createPgStatement as pg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  // Generates statement: 
  // "SELECT * FROM "persons"
  return pg(select({table: 'album'}));
}
```

Note that you can also specify the schema in your table identifier:

```js
import { select, createPgStatement as pg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  // Generates statement:
  // SELECT * FROM "private"."persons"
  return pg(select({table: 'private.album'}));
}
```

And you can specify an alias as well

```js
import { select, createPgStatement as pg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  // Generates statement:
  // SELECT * FROM "private"."persons" as "people"
  return pg(select({table: {al: 'private.album'}));
}
```

#### Specifying columns

You can specify columns with the columns property. If this isn't set to a value, it defaults to `*`:

```js
import { select, createPgStatement as pg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  // Generates statement:
  // SELECT "id", "name"
  // FROM "persons"
  return pg(select({
    table: 'album',
    columns: ['album_id', 'title']
  }));
}
```

You can specify a column's table as well:

```js
import { select, createPgStatement as pg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  // Generates statement: 
  // SELECT "id", "persons"."name"
  // FROM "persons"
  return pg(select({
    table: 'album',
    columns: ['album_id', 'album.title']
  }));
}
```

You can use aliases

```js
import { select, createPgStatement as pg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  // Generates statement: 
  // SELECT "id", "persons"."name" as "theName"
  // FROM "persons"
  return pg(select({
    table: 'album',
    columns: ['album_id', { name: 'album.title' }]
  }));
}
```

#### Limits and offsets

You can apply limit and offset to the query:

```js
import { select, createPgStatement as pg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  // Generates statement: 
  // SELECT "id", "name"
  // FROM "persons"
  // LIMIT :limit
  // OFFSET :offset
  return pg(select({ table: 'album', limit: 10, offset: 40 }));
}
```

#### Order By

You can sort your results with the `orderBy` property. Provide an array of objects specifying the column and an optional `dir` property:

```js
import { select, createPgStatement as pg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  return pg(select({
    table: 'album',
    columns: ['album_id', 'artist_id', 'title'],
    orderBy: [{column: 'artist_id'}, {column: 'title', dir: 'DESC'}]
  }));
}
```

#### Filters

You can build filters by using the special condition object:

```js
import { select, createPgStatement as pg } from '@aws-appsync/utils/rds'
export function request(ctx) {
  return pg(select({
    table: 'album',
    columns: ['album_id', 'artist_id', 'title'],
    where: {title: {beginsWith: 'W'}}
  }));
}
```

You can also combine filters:

```js
import { select, createPgStatement as pg } from '@aws-appsync/utils/rds'
export function request(ctx) {
  return pg(select({
    table: 'track',
    columns: ['track_id', 'album_id', 'milliseconds'],
    where: {album_id: {between: [1,2]}, milliseconds: {gt: 100_000}}
  }));
}
```

You can also create OR statements:

```js
import { select, createPgStatement as pg } from '@aws-appsync/utils/rds'
export function request(ctx) {
  return pg(select({
    table: 'track',
    columns: ['track_id', 'name'],
    where: { or: [
      { unit_price: { lt: 1} },
      { composer: { attributeExists: false } }
    ]}
  }));
}
```

You can also negate a condition with not:

```js
import { select, createPgStatement as pg } from '@aws-appsync/utils/rds'
export function request(ctx) {
  return createPgStatement(select({
    table: 'track',
    columns: ['track_id', 'name'],
    where: { not: [
      {or: [
        { unit_price: { lt: 1} },
        { composer: { attributeExists: false } }
      ]}
    ]}
  }));
}
```

You can use the following operators to compare values:

> NO UPDATE

```table
Operator  Description  Possible value types
eq  Equal  number, string, boolean
ne  Not equal  number, string, boolean
le  Less than or equal  number, string
lt  Less than  number, string
ge  Greater than or equal  number, string
gt  Greater than  number, string
contains  Like  string
notContains  Not like  string
beginsWith  Starts with prefix  string
between  Between two values  number, string
attributeExists  The attribute is not null  number, string, boolean
size  checks the length of the element  string
```

You can use the `sql` helper to write custom conditions:

```javascript
import { select, createPgStatement as pg, agg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  return pg(select({
    from: 'album',
    where: sql`length(title) > ${ctx.args.size}`
  }))
}
```

#### Joins

You can use join in you select statements.

```js
import { select, createPgStatement as pg, agg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  return pg(select({
    from: 'album',
    join: [{from: 'artist', using: ['artist_id']}]
  }))
}
```

Note: use `using` when both sides of the join use the same name for the joining column(s). To specify you custom condition, use `on` with the `sql` util.

```js
import { select, createPgStatement as pg, agg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  return pg(select({
    from: 'album',
    join: [{from: 'artist', on: sql`album.some_id = artist.another_id`}]
  }))
}
```

The following join expressions are supported

- join
- innerJoin
- leftJoin
- leftOuterJoin
- rightJoin
- rightOuterJoin
- fullOuterJoin - Postgres only
- crossJoin
- joinNatural
- innerJoinNatural
- leftJoinNatural
- leftOuterJoinNatural
- rightJoinNatural
- rightOuterJoinNatural
- fullOuterJoinNatural - Postgres only

#### Aggregates

With AppSync, you can do aggregations using the following functions: `min`, `minDistinct` , `max` , `maxDistinct` , `sum` , `sumDistinct` , `avg` , `avgDistinct` , `count` , `countDistinct`. When using aggregations, you can make use of `groupBy` and `having`

To count the rows in a result: Get the number of albums for every artist with a minimum of 5 albums.

```js
import { select, createPgStatement as pg, agg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  return pg(select({
    table : 'album',
    columns: ['artist_id', {count: agg.count('*')}],
    groupBy: ['artist_id'],
    having: {
      album_id: {
        count: {ge: 5}
      }
    }
  }))
}
```

#### More on aliases

You can leverage aliases in your queries. Aliases are supported on the `table`, `from`, `columns` and `using` properties.

```js
import { select, createPgStatement as pg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  return pg(select({
    table : {people: persons },
    columns: ['id', {firstAndLastName: 'name'}]
  }));
}
```

#### Subqueries

You can use subqueries in your select statement by leveraging the `from` property. `from` works like `table`, but supports strings, aliases, `sql` and `select`!

```javascript
import { select, createPgStatement as pg, agg } from '@aws-appsync/utils/rds';
export function request(ctx) {

  // First, fetch all the albums that have more than 1 genre in their tracklist
  const sub = select({
    from: 'album',
    columns: [
      'album_id', 'title', 'artist_id',
      {tracks: agg.count('track_id')},
      {genres: agg.countDistinct('genre_id')}
    ],
    join: [{from: 'track', using: ['album_id']}],
    groupBy: [1], // you can use ordinal in the groupBy close
    having: {
      'genre_id': {
        countDistinct: {gt: 1}
      }
    },
    orderBy: [{column: 'genres', dir: 'desc'}]
  })

  // next, use the subquery and retrieve the name of the artist for those albums
  return pg(select({
    from: { sub }, // an identifier or an alias.
    columns: ['album_id', 'title', 'name'],
    join: [{from: 'artist', using: ['artist_id']}]
  }))
}
```

### Insert

The insert utility provides a straightforward way of inserting single row items in your database with the INSERT operation.

#### Single item insertions

To insert an item, specify the table and then pass in your object of values. The object keys are mapped to your table columns. Columns names are automatically escaped, and values are sent to the database using the variable map:

```js
import { insert, createMySQLStatement as mysql } from '@aws-appsync/utils/rds';
export function request(ctx) {
  // Generates statement:
  // INSERT INTO `persons`(`name`)
  // VALUES(:NAME)
  return mysql(insert({ table: 'persons', values: ctx.args.input }))
}
```

#### MySQL use case

You can combine an insert followed by a select to retrieve your inserted row:

```js
import { insert, select, createMySQLStatement as mysql } from '@aws-appsync/utils/rds';
export function request(ctx) {
  const { input: values } = ctx.args;
  const insertStatement = insert({  table: 'persons', values });
  const selectStatement = select({
    table: 'persons',
    columns: '*',
    where: { id: { eq: values.id } },
    limit: 1,
  });

  // Generates statement:
  // INSERT INTO `persons`(`name`)
  // VALUES(:NAME)
  // and
  // SELECT *
  // FROM `persons`
  // WHERE `id` = :ID
  return mysql(insertStatement, selectStatement)
}
```

#### Postgres use case

With Postgres, you can use returning

to obtain data from the row that you inserted. It accepts * or an array of column names:

```js
import { insert, createPgStatement as pg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  const { input: values } = ctx.args;
  const statement = insert({
    table: 'persons',
    values,
    returning: '*'
  });

  // Generates statement:
  // INSERT INTO "persons"("name")
  // VALUES(:NAME)
  // RETURNING *
  return pg(statement)
}
```

### Update

The update utility allows you to update existing rows. You can use the condition object to apply changes to the specified columns in all the rows that satisfy the condition. For example, let's say we have a schema that allows us to make this mutation. We want to update the name of Person with the id value of 3 but only if we've known them (known_since) since the year 2000:

```graphql
mutation Update {
  updatePerson(
    input: {id: 3, name: "Jon"},
    condition: {known_since: {ge: "2000"}}
    ) {
    id
    name
  }
}
```

Our update resolver looks like this:

```js
import { update, createPgStatement as pg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  const { input: { id, ...values }, condition } = ctx.args;
  const where = { ...condition, id: { eq: id } };
  const statement = update({
    table: 'persons',
    values,
    where,
    returning: ['id', 'name'],
  });

  // Generates statement:
  // UPDATE "persons"
  // SET "name" = :NAME, "birthday" = :BDAY, "country" = :COUNTRY
  // WHERE "id" = :ID
  // RETURNING "id", "name"
  return pg(statement)
}
```

We can add a check to our condition to make sure that only the row that has the primary key id equal to 3 is updated. Similarly, for Postgres inserts, you can use returning to return the modified data.
Remove

The remove utility allows you to delete existing rows. You can use the condition object on all rows that satisfy the condition. Note that delete is a reserved keyword in JavaScript. remove should be used instead:

```js
import { remove, createPgStatement as pg } from '@aws-appsync/utils/rds';
export function request(ctx) {
  const { input: { id }, condition } = ctx.args;
  const where = { ...condition, id: { eq: id } };
  const statement = remove({
    table: 'persons',
    where,
    returning: ['id', 'name'],
  });

  // Generates statement:
  // DELETE "persons"
  // WHERE "id" = :ID
  // RETURNING "id", "name"
  return pg(statement)
}
```

### Casting

In some cases, you may want more specificity about the correct object type to use in your statement. You can use the provided type hints to specify the type of your parameters. AWS AppSync supports the same type hints as the Data API. You can cast your parameters by using the `typeHint` functions from the AWS AppSync rds module.

The following example allows you to send an array as a value that is casted as a JSON object. We use the -> operator to retrieve the element at the index 2 in the JSON array:

```js
import { sql, createPgStatement as pg, toJsonObject, typeHint } from '@aws-appsync/utils/rds';

export function request(ctx) {
  const arr = ctx.args.list_of_ids
  const statement = sql`select ${typeHint.JSON(arr)}->2 as value`
  return pg(statement)
}

export function response(ctx) {
  return toJsonObject(ctx.result)[0][0].value
}
```

Casting is also useful when handling and comparing DATE, TIME, and TIMESTAMP:

```js
import { select, createPgStatement as pg, typeHint } from '@aws-appsync/utils/rds';
export function request(ctx) {
  const when = ctx.args.when
  const statement = select({
    table: 'persons',
    where: { createdAt : { gt: typeHint.DATETIME(when) } }
  })
  return pg(statement)
}
```

Here's another example showing how you can send the current date and time:

```js
import { sql, createPgStatement as pg, typeHint } from '@aws-appsync/utils/rds';

export function request(ctx) {
  const now = util.time.nowFormatted('YYYY-MM-dd HH:mm:ss')
  return createPgStatement(sql`select ${typeHint.TIMESTAMP(now)}`)
}
```

Available type hints

- `typeHint.DATE`  - The corresponding parameter is sent as an object of the DATE type to the database. The accepted format is YYYY-MM-DD.
- `typeHint.DECIMAL`  - The corresponding parameter is sent as an object of the DECIMAL type to the database.
- `typeHint.JSON`  - The corresponding parameter is sent as an object of the JSON type to the database.
- `typeHint.TIME`  - The corresponding string parameter value is sent as an object of the TIME type to the database. The accepted format is HH:MM:SS[.FFF].
- `typeHint.TIMESTAMP` - The corresponding string parameter value is sent as an object of the TIMESTAMP type to the database. The accepted format is YYYY-MM-DD HH:MM:SS[.FFF].
- `typeHint.UUID` - The corresponding string parameter value is sent as an object of the UUID type to the database.
