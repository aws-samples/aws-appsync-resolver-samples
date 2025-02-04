// Create AppSync API
resource "aws_appsync_graphql_api" "appsync_api" {
  authentication_type = "API_KEY"
  name                = "WBD Proxy API"

  schema = file("schema.graphql")
}

// Create API Key
resource "aws_appsync_api_key" "appsync_api_key" {
  api_id  = aws_appsync_graphql_api.appsync_api.id
  expires = "2025-05-01T04:00:00Z"
}

// Enable caching
# resource "aws_appsync_api_cache" "wbd_proxy_cache_config" {
#   api_id               = aws_appsync_graphql_api.appsync_api.id
#   api_caching_behavior = "PER_RESOLVER_CACHING"
#   type                 = "LARGE"
#   ttl                  = 3600
# }

resource "aws_lambda_function" "appsync_datasource" {
  filename         = "lambda_function.zip"
  function_name    = "posts_lambda"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
}

resource "aws_appsync_datasource" "lambda_datasource" {
  api_id = aws_appsync_graphql_api.appsync_api.id
  name   = "lambdaPosts"
  type   = ""

  # lambda_config {
  #   function_arn = 
  # }
}

resource "aws_appsync_resolver" "listPosts" {
  api_id = aws_appsync_graphql_api.appsync_api.id
  type   = "Query"
  field  = "listPosts"

  data_source = aws_appsync_datasource.lambda_datasource.name
  kind        = "UNIT"

  code = file("resolvers/listPosts.js")

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
}


resource "aws_appsync_resolver" "getPost" {
  api_id = aws_appsync_graphql_api.appsync_api.id
  type   = "Query"
  field  = "getPost"

  data_source = aws_appsync_datasource.lambda_datasource.name
  kind        = "UNIT"

  code = file("resolvers/getPost.js")

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  caching_config {
    ttl = 3600
  }
}