#!/bin/bash

input="$@"
scope=''

if [ -z "$input" ]; then
  lerna run test --ignore demo
else
  for pkg in $input
  do
    scope="$scope --scope $pkg"
  done

  lerna run test --ignore demo $scope
fi

