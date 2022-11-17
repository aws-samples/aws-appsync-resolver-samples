# Todo API

This folder provides the implementation for a Todo API implemented with AppSync JavaScript resolvers.
The API allows you to interact with a Todo type:

```graphql
type Todo {
  id: ID!
  title: String
  description: String
  owner: String
}
```

The [functions](./functions/) folder contains the code for the AppSync functions, while the [resolvers](./resolvers/) folder contains the code for the pipeline resolvers. The resolvers in this API do not implement any before or after business logic, and the same code is use for all resolvers.

## Deploy the stack

Deploy this stack by using [template.yaml](./template.yaml) from the Cloudformation console or using the AWS CLI.

With the AWS CLI, from this folder:

```sh
aws cloudformation deploy --template-file ./template.yaml --stack-name demo-todo-api-js --capabilities CAPABILITY_IAM
```

## Delete the stack

To delete your resources: visit the Cloudformation console and delete the stack.

With the AWS CLI:

```sh
aws cloudformation delete-stack --stack-name demo-todo-api-js
```

Note: The DynamoDB table deployed by this template is retained when the stack is deleted.
