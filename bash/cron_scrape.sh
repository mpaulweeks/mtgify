export PATH=$PATH:/home/ec2-user/.nvm/versions/node/v8.9.1/bin/
export $(cat .env* | grep -v ^# | xargs)

nout=$(node script/scrape.js)
echo $nout
if [[ $nout == *"true" ]]
then
  echo "New MTG JSON version..."

  node script/gen_json.js
  node script/upload_s3_json.js
else
  echo "MTG JSON up to date"
fi
