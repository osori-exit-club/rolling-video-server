#!/bin/sh

SCRIPT_DIR=$(dirname $0)
echo $SCRIPT_DIR

cd $SCRIPT_DIR/..

npm run build
pm2 reload ecosystem.json
echo $?