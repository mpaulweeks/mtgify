export PATH=$PATH:/home/ec2-user/.nvm/versions/node/v8.9.1/bin/

git checkout master
gout=$(git pull 2>&1)
echo $gout
if ! [[ $gout == *"Already up-to-date." ]]
then
  echo "Source changes found..."

  # https://github.com/npm/npm/issues/17722
  npm install --no-save
  npm prune

  node script/gen-json.js
  npm run build

  # todo s3
fi
