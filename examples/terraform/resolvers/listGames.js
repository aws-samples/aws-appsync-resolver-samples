import { util } from "@aws-appsync/utils";

export function request(ctx) {
  return fetch(`/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "da2-hm3d2t2bhffxlc6kcstuheb354", // we can use other strategies such as env var or pipeline resolvers to fetch the auth token
    },

    body: {
      query: `query MyQuery { listGames  ${ctx.info.selectionSetGraphQL} }`,
    },
  });
}

export function response(ctx) {
  const { statusCode, body } = ctx.result;
  // if response is 200, return the response
  if (statusCode === 200) {
    return JSON.parse(body).data.listGames; // this will depend on the response shape of the actual api/datasource
  }
  // if response is not 200, append the response to error block.
  util.appendError(body, statusCode);
}

function fetch(resourcePath, options) {
  const { method = "GET", headers, body: _body, query } = options;
  const body = typeof _body === "object" ? JSON.stringify(_body) : _body;
  return {
    resourcePath,
    method,
    params: { headers, query, body },
  };
}
