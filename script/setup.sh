#!/bin/sh

if ! command -v nvm &> /dev/null; then
    echo "nvm could not be found"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    sh ~/.nvm/nvm.sh
    nvm install 1
    nvm alias default 18
else
    echo "[PASS] nvm installed"
fi

if ! command -v pm2 &> /dev/null; then
    echo "pm2 could not be found"
    npm i -g pm2
else
    echo "[PASS] pm2 installed"
fi

if ! command -v nest &> /dev/null; then
    echo "nest could not be found"
    npm i -g @nestjs/cli
else
    echo "[PASS] nest installed"
fi

export NODE_OPTIONS=--max_old_space_size=4096
