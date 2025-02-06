// Create AppSync API
resource "aws_appsync_graphql_api" "appsync_api" {
  authentication_type = "API_KEY"
  name                = "AppSync Terraform API"

  schema = file("schema.graphql")
}

// Create API Key
resource "aws_appsync_api_key" "appsync_api_key" {
  api_id  = aws_appsync_graphql_api.appsync_api.id
  expires = "2025-05-01T04:00:00Z"
}

// Add HTTP Datasource
resource "aws_appsync_datasource" "todo_http_datasource" {
  api_id = aws_appsync_graphql_api.appsync_api.id
  name   = "lambdaPosts"
  type   = "HTTP"

  http_config {
    endpoint = "https://jsonplaceholder.typicode.com"
  }
}

// Add resolver for Query.listTodos
resource "aws_appsync_resolver" "listTodos" {
  api_id = aws_appsync_graphql_api.appsync_api.id
  type   = "Query"
  field  = "listTodos"

  data_source = aws_appsync_datasource.todo_http_datasource.name
  kind        = "UNIT"

  code = file("resolvers/listTodos.js")

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
}

// Add resolver for Query.getTodo
resource "aws_appsync_resolver" "getTodo" {
  api_id = aws_appsync_graphql_api.appsync_api.id
  type   = "Query"
  field  = "getTodo"

  data_source = aws_appsync_datasource.todo_http_datasource.name
  kind        = "UNIT"

  code = file("resolvers/getTodo.js")

  runtime {
    name            = "APPSYNC_JS"
    runtime_version = "1.0.0"
  }
  caching_config {
    ttl = 3600
  }
}


// To Enable caching uncomment the following code block
# resource "aws_appsync_api_cache" "cache_config" {
#   api_id               = aws_appsync_graphql_api.appsync_api.id
#   api_caching_behavior = "PER_RESOLVER_CACHING"
#   type                 = "LARGE"
#   ttl                  = 3600
# }
