#!/bin/bash

input="$@"
scope=''

if [ -z "$input" ]; then
  lerna run lint:nofix --ignore demo
else
  for pkg in $input
  do
    scope="$scope --scope $pkg"
  done

  lerna run lint:nofix --ignore demo $scope
fi

