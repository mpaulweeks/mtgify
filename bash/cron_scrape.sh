export PATH=$PATH:/home/ec2-user/.nvm/versions/node/v8.9.1/bin/
export $(cat .env* | grep -v ^# | xargs)

nout=$(node script/check_version.js)
echo $nout

if [[ $nout == *"true" ]]
then
  echo "New MTG JSON version..."

  node script/scrape.js || exit 1
  node script/gen_json.js || exit 1
  node script/upload_s3_json.js || exit 1
  node script/upload_s3_version.js || exit 1
else
  echo "MTG JSON up to date"
fi
