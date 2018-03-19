export PATH=$PATH:/home/ec2-user/.nvm/versions/node/v8.9.1/bin/

nout=$(node script/scrape.js)
echo $nout
if [[ $nout == *"true" ]]
then
  echo "New MTG JSON version..."

  node script/gen-json.js

  # todo s3
fi
