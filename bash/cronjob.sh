# crontab
# */5 * * * * ec2-user cd /home/ec2-user/mtg-toolbox && ./bash/cronjob.sh
# pulls source, rebuilds js and json if change
# pings version.json, downloads and rebuilds json if update

./bash/cron_pull.sh
./bash/cron_scrape.sh
