<p align="center">
  <a href="https://docs.aws.amazon.com/appsync/latest/devguide/quickstart.html">
    <img src="./appsync-logo-600.png" height="96" />
    <h1 align="center">AWS AppSync GraphQL Samples</h1>
  </a>
</p>

Welcome to the AWS AppSync JavaScript Samples repository! This collection of samples provides clear and concise examples of utilizing AppSync JavaScript resolvers and functions with various data sources on AWS AppSync. These samples are here to help you get started quickly and enable you to kickstart your own projects.

You can use this repository to get started in both TypeScript and JavaScript solutions.

**[Documentation](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-reference-overview-js.html)** | **[npm - appsync-utils](https://www.npmjs.com/package/@aws-appsync/utils)** | **[npm - eslint plugin](https://www.npmjs.com/package/@aws-appsync/eslint-plugin)** | **[Samples](./samples/)** | **[CloudFormation and CDK Examples](./examples/)**

## Table of contents <!-- omit in toc -->

- [About resolvers](#about-resolvers)
- [Content](#content)
- [Features](#features)
- [Getting started](#getting-started)
  - [Working locally](#working-locally)
  - [In the console](#in-the-console)
- [Feedback and Support](#feedback-and-support)

## About resolvers

Resolvers are the connectors between GraphQL and a data source. They tell AWS AppSync how to translate an incoming GraphQL request into instructions for your backend data source, and how to translate the response from that data source back into a GraphQL response. With AWS AppSync, you can write resolvers using JavaScript, that are run on the AppSync JavaScript (APPSYNC_JS) runtime.

The AppSync JavaScript runtime allows developers to write expressive logic in JavaScript for their business requirements, while using syntax, constructs, and features of the language that they are already familiar with. The runtime has some restrictions from tradeoffs that were made in order for to provide high performance and consistent execution in a secure, multi-tenant environment in a serverless manner. However, the tradeoffs do come with benefits as well, such as no extra costs and lower latencies. For a detailed list of supported features in the runtime, see our [resolver reference](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-util-reference-js.html).

JavaScript resolvers allow you to express your business logic using a simple interface. At its core, your resolvers implement a `request` and `response` function.

```js
export function request(ctx) {
	return {};
}

export function response(ctx) {
	return ctx.result;
}
```

## Content

- [examples](./samples/): Contains AWS Cloudformation, AWS CDK and other IaC platforms sample APIs
- [samples](./samples/) Contains AppSync resolver and functions templates that you can use in your own APIs

## Features

For a full list of supported feature, see our [runtime features documentation](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-util-reference-js.html).

## Getting started

If you are new to AppSync, get an overview in our [documentation](https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html).

### Working locally

You can get started with one of the CDK [examples](./examples/cdk/). Simply clone this repo and start with one of the example directories. Run `npm install` to install all the dependencies. You can review the code and run `npm run cdk deploy` to launch the application.

The best way to work locally in your own project is to start by installing the two libraries:

- [@aws-appsync/utils](https://www.npmjs.com/package/@aws-appsync/utils) - Provides type validation and autocompletion in code editors.
- [@aws-appsync/eslint-plugin](https://www.npmjs.com/package/@aws-appsync/eslint-plugin) - Catches and fixes problems quickly during development.

Find out more [here](https://docs.aws.amazon.com/appsync/latest/devguide/resolver-reference-overview-js.html#utility-resolvers).

### In the console

You can also work from the console and edit your code directly the console editor. Note that TypeScript is not supported from the console.

## Feedback and Support

If you have any questions, feedback, or need assistance, please don't hesitate to open an issue on this repository. For general inquiries about AppSync, please visit our [Community repository](https://github.com/aws/aws-appsync-community)

---

This library is licensed under the MIT-0 License. See the LICENSE file.
