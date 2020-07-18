const MtgJson = require('../lib/MtgJson');
const CDN = require('../lib/CDN');

(async () => {
  await MtgJson.updateVersion();
  const jsonFiles = [
    'json/version.json',
  ];
  CDN.uploadFilesSync(jsonFiles);
})();
