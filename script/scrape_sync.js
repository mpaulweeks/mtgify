const MtgJson = require('../lib/MtgJson');

(async () => {
  await MtgJson.scrapeJsonSync();
})();
