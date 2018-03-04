#!/bin/sh

# 0 * * * * ec2-user cd /home/ec2-user/mtg-toolbox && ./bash/cronjob.sh
# pings version.json runs once per hour, downloads zips if there's an update

git pull
./bash/refresh.sh
