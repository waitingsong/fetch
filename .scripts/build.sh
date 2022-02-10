#!/bin/bash

input="$@"
scope=''

if [ -z "$input" ]; then
  lerna run build --ignore demo
else
  for pkg in $input
  do
    scope="$scope --scope $pkg"
  done

  lerna run build --ignore demo $scope
fi

