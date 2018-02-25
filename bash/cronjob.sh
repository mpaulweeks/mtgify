#!/bin/sh

# 0 8 * * * ec2-user cd /home/ec2-user/mtg-toolbox && ./bash/cronjob.sh

/home/ec2-user/.nvm/versions/node/v8.9.1/bin/node script/scrape.js
