# AppSync Helper Library

*a helper library to help you get started with your AppSync API and TypeScript resolvers.*

This library helps you:

- organize your AppSync CDK project by using a directory based approach
- Automatically builds your TypeScript resolvers
- Links your resolvers to your data sources so that you dont have to

## Getting started

```
.
├── appsync
│   ├── resolvers
│   │   ├── Mutation.createTodo.[todos].ts
│   │   ├── Mutation.deleteTodo.[todos].ts
│   │   ├── Mutation.updateTodo.[todos].ts
│   │   ├── Query.getTodo.[todos].ts
│   │   ├── Query.listTodos.[todos].ts
│   │   └── utils.ts
│   └── schema.graphql
└── project-stack.ts
```

