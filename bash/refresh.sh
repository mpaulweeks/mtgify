#!/bin/sh
export PATH=$PATH:/home/ec2-user/.nvm/versions/node/v8.9.1/bin/

npm install
node script/scrape.js
node script/gen-json.js
npm run build
