#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
shopt -s nullglob

script_path=$(
  cd "$(dirname "${BASH_SOURCE[0]}")"
  pwd -P
)


node "$script_path/evaluate/index.mjs" "$@"