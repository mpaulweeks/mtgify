# crontab
# 0 8 * * * ec2-user cd /home/ec2-user/mtgify && ./bash/cronjob.sh
# pulls source, executes rebuild.sh

git checkout master
git pull
./bash/rebuild.sh
