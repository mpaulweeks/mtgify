const MtgJson = require('../lib/MtgJson');

(async () => {
  const files = await MtgJson.scrapeJson();
  console.log('scrape success!');
})();
