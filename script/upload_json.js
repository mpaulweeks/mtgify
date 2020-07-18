const CDN = require('../lib/CDN');

(async () => {
  const jsonFiles = [
    'json/CardInfo.compressed.json',
  ];
  await CDN.uploadFilesSync(jsonFiles);
})();
