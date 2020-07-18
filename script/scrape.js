const MtgJson = require('../lib/MtgJson');

(async () => {
  const files = await MtgJson.scrapeJsonSync();
  console.log('scrape success!', files.map(f => f.jsonFileName));
})();
