/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateTodo = /* GraphQL */ `
  subscription OnCreateTodo(
    $id: ID
    $title: String
    $description: String
    $owner: String
  ) {
    onCreateTodo(
      id: $id
      title: $title
      description: $description
      owner: $owner
    ) {
      id
      title
      description
      owner
      __typename
    }
  }
`;
export const onUpdateTodo = /* GraphQL */ `
  subscription OnUpdateTodo(
    $id: ID
    $title: String
    $description: String
    $owner: String
  ) {
    onUpdateTodo(
      id: $id
      title: $title
      description: $description
      owner: $owner
    ) {
      id
      title
      description
      owner
      __typename
    }
  }
`;
export const onDeleteTodo = /* GraphQL */ `
  subscription OnDeleteTodo(
    $id: ID
    $title: String
    $description: String
    $owner: String
  ) {
    onDeleteTodo(
      id: $id
      title: $title
      description: $description
      owner: $owner
    ) {
      id
      title
      description
      owner
      __typename
    }
  }
`;
