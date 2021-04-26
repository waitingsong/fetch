#!/bin/bash

input="$@"
scope=''

if [ -z "$input" ]; then
  lerna run lint  --ignore demo--parallel
else
  for pkg in $input
  do
    scope="$scope --scope $pkg"
  done

  lerna run lint  --ignore demo--parallel $scope
fi

