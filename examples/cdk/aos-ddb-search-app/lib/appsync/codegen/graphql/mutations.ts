/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTodo = /* GraphQL */ `
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      title
      description
      owner
      __typename
    }
  }
`;
export const updateTodo = /* GraphQL */ `
  mutation UpdateTodo($input: UpdateTodoInput!) {
    updateTodo(input: $input) {
      id
      title
      description
      owner
      __typename
    }
  }
`;
export const deleteTodo = /* GraphQL */ `
  mutation DeleteTodo($input: DeleteTodoInput!) {
    deleteTodo(input: $input) {
      id
      title
      description
      owner
      __typename
    }
  }
`;
export const createIndex = /* GraphQL */ `
  mutation CreateIndex($index: String!) {
    createIndex(index: $index)
  }
`;
export const index = /* GraphQL */ `
  mutation Index($input: IndexTodoInput!) {
    index(input: $input)
  }
`;
