#!/bin/bash
set +e

dirs=" .githooks .scripts .github"

for dir in $dirs; do
  find $dir -type f -iname "*.sh" -print0 | xargs -0II git update-index --ignore-missing --chmod=+x I
  find $dir -type f -iname "*.mjs" -print0 | xargs -0II git update-index --ignore-missing --chmod=+x I
done

echo "Commit changes if changed!"

set -e

