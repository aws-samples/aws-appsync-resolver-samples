# This is a utility function that you can use to call evaluateCode from the command line

#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
# set -x
shopt -s nullglob

script_path=$(
  cd "$(dirname "${BASH_SOURCE[0]}")"
  pwd -P
)

CODE_PATH="$script_path"
OUT_PATH="$script_path"

function run_evaluate() { #HELP Evaluates code:\nHOLDER evaluate <path.js> [request|response] optional:<context>
  [[ $# -lt 2 ]] && echo "  -> evaluate.sh <path.js> [request|response] optional:<context>" && exit 1
  CODE="$1"
  FN="$2"
  CONTEXT=${3:-"file://$CODE_PATH/context.json"}
  RES=$(aws appsync evaluate-code --code "file://$CODE" --function $FN \
    --context "$CONTEXT" \
    --runtime name=APPSYNC_JS,runtimeVersion=1.0.0)
  echo "$RES"
  echo "$RES" >"$OUT_PATH/response.json"
  echo "$RES" | jq 'select(.evaluationResult != null) | .evaluationResult | fromjson'
  echo "$RES" | jq -r 'select(.logs != null) | .logs[] | @text'
  echo "$RES" | jq -r 'select(.error != null) | .error.message'
}

function run_help() {
  sed -n "s/^.*#HELP\\s//p;" <"$1" | sed "s/\\\\n/\n\t/g;s/$/\n/;s!HOLDER!${1/!/\\!}!g"
}

[[ -z "${1-}" ]] && run_help "$0" && exit 1

run_evaluate "$1" "${@:2}"
