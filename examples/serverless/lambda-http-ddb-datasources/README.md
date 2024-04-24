# Serverless Framework AWS AppSync Example

Type `Post` is using Lambda data source

```graphql
type Post {
	id: ID!
	title: String
	body: String
}
```

Type `User` is using HTTP data source

```graphql
type User {
	id: ID!
	firstName: String
	lastName: String
}
```

Type `Todo` is using DynamoDB data source with util examples in the resolvers

```graphql
type Todo {
	id: ID!
	title: String
	completed: Boolean!
}
```

## Deploy the stack

Deploy this stack by using Serverless Framework as defined in [serverless.yml](./serverless.yml) by running `serverless deploy`.

## Delete the resource

To delete your resources: visit the Cloudformation console and delete the stack.

With the AWS CLI:

```sh
aws cloudformation delete-stack --stack-name sls-appsync-example-dev
```

Note: The stack name `sls-appsync-example-dev` above assumes the `service` and `environemnt` attributes in `serverless.yml` were not modified.
