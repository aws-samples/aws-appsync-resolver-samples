# AppSync Helper Library

*a helper library to help you get started with your AppSync API and TypeScript resolvers.*

This library helps you:

- Get started with AppSync resources in your CDK project
- Automatically builds your TypeScript resolvers
- Links your resolvers to your data sources

## Init

First install dependencies and build the project:

```sh
npm install
npm run build
npm link
```

## Getting started

You can find an example using this construct [here](../../dynamodb-todo-app/).

To use the helper, first install it:

```sh
npm link appsync-helper -D
```

Simply pass the path to your main appsync folder in the `AppSyncHelper` props.

```typescript
const appSyncApp = new AppSyncHelper(this, 'TodoAPI', {
  basedir: path.join(__dirname, 'appsync'),
  logConfig: { fieldLogLevel: FieldLogLevel.ALL },
  xrayEnabled: true,
});

// add data sources
appSyncApp.addNoneDataSource('NONE');
appSyncApp.addDynamoDbDataSource('todos', todoTable);

// Important!!! call bind to bring it all together
appSyncApp.bind();
```

### Expected folder structure

The helper finds your schema, resolvers, and functions based on an expected directory structure

```sh
lib
├── appsync
│   ├── resolvers
│   │   ├── Mutation.createTodo.[todos].ts
│   │   ├── Mutation.deleteTodo.[todos].ts
│   │   ├── Mutation.updateTodo.[todos].ts
│   │   ├── Query.getTodo.[todos].ts
│   │   ├── Query.listTodos.[todos].ts
│   │   ├── Query.queryByOwner
│   │   │   ├── 1.[todos].ts
│   │   │   └── 2.[NONE].ts
│   │   └── utils.ts
│   └── schema.graphql
└── dynamodb-todo-app-stack.ts
```

Your unit resolver files follow this naming format:

```text
<Type>.<Field>.[<data source name>].ts
```

Your pipeline resolvers are a folder with this format:

```text
<Type>.<field>
```

and an optional `index.ts` in the folder as the pipeline resolver code. If no `index.ts` is present the following default code is used:

```ts
export function request(){ return {} }
export function response(ctx){ return ctx.prev.result}
```

The functions in your pipeline folder have this format:

```text
<optional-text.><order>.[<data source name>].ts
```

That's it. The construct validates your schema and ties your resolvers to the named data sources. If your schema is invalid or if your resolvers are linked to data sources that do not exist, the cdk synth step will fail. This saves your from an unnecessary deployment.
