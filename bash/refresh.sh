#!/bin/sh
export PATH=$PATH:/home/ec2-user/.nvm/versions/node/v8.9.1/bin/

node script/scrape.js
node script/gen-json.js
yarn build
