#!/bin/sh

SCRIPT_DIR=$(dirname $0)
echo $SCRIPT_DIR

cd $SCRIPT_DIR/..

export NODE_OPTIONS="--max-old-space-size=8192"

npm install

npm run build
pm2 reload ecosystem.json
echo $?