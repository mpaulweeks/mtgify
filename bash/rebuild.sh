# rebuild code, gen everything, upload everything

export PATH=$PATH:/home/ec2-user/.nvm/versions/node/v8.9.1/bin/
export $(cat .env* | grep -v ^# | xargs)

# https://github.com/npm/npm/issues/17722
npm install
npm prune
git checkout -- package-lock.json

npm run build
npm run cron-code
npm run cron-json
