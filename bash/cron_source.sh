export PATH=$PATH:/home/ec2-user/.nvm/versions/node/v8.9.1/bin/
export $(cat .env* | grep -v ^# | xargs)

git checkout master
gout=$(git pull 2>&1)
echo $gout
if ! [[ $gout == *"Already up-to-date." ]]
then
  echo "Source changes found..."

  # https://github.com/npm/npm/issues/17722
  npm install
  npm prune
  git checkout -- package-lock.json

  npm run build
  node script/upload_s3_dist.js

  node script/gen-json.js
  node script/upload_s3_json.js
fi
