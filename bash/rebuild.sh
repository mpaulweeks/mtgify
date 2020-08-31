# rebuild code, gen everything, upload everything

nvm use 10.16.0
export GOOGLE_APPLICATION_CREDENTIALS="gcp-key.json"

# export PATH=$PATH:/home/ec2-user/.nvm/versions/node/v10.16.0/bin/
# export $(cat .env* | grep -v ^# | xargs)

# https://github.com/npm/npm/issues/17722
npm install
git checkout -- package-lock.json

npm run cron-code && npm run cron-json
