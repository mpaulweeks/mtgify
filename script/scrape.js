'use strict'

const MtgJson = require('../lib/MtgJson')

MtgJson.scrapeJsonSync()
  .then(files => console.log('scrape success!', files.map(f => f.jsonFileName)))
  .catch(err => {
    console.log(err);
    process.exit(1);
  })
