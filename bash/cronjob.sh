# crontab
# */5 * * * * ec2-user cd /home/ec2-user/mtg-toolbox && ./bash/cronjob.sh
# pulls source, rebuilds js and json if change
# pings version.json, downloads and rebuilds json if update

./bash/cron_source.sh
./bash/cron_json.sh
