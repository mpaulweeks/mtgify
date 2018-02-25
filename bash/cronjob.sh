#!/bin/sh

# 0 8 * * * ec2-user cd /home/ec2-user/mtg-toolbox && ./bash/cronjob.sh

nvm use 8.9.1
npm run scrape
