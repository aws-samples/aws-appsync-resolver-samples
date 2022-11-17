# AWS AppSync Resolver Samples

This repo contains samples showing how to use AppSync JavaScript resolvers and functions to connect to data sources and build GraphQL API. You can use these samples to help you quickly get started on your own projects.

- Learn more about JavaScript support in AWS AppSync by visiting the [Resolver reference (JavaScript)](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-reference-js-version.html) documentation.

## Content

- [samples](./samples/): Contains Cloudformation and AWS CDK sample APIs
- [templates](./templates/) Contains AppSync functions templates that you can leverage in your own APIs

## About resolvers

Resolvers are the connectors between GraphQL and a data source. They tell AWS AppSync how to translate an incoming GraphQL request into instructions for your backend data source, and how to translate the response from that data source back into a GraphQL response. With AWS AppSync, you can write your resolver functions using JavaScript with the `APPSYNC_JS` runtime. For a complete list of features and functionality supported by the `APPSYNC_JS` runtime, see JavaScript runtime features for resolvers and functions.

----
This library is licensed under the MIT-0 License. See the LICENSE file.
