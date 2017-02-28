#!/usr/bin/env bash

# This script installs and configures the environment, requirements in PATH:
# - bower
OLDP=$PWD
echo $OLDP
cd public/
bower install
cd $OLDP

# Node components such as gulp
npm install
