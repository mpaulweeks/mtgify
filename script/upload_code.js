const CDN = require('../lib/CDN');

(async () => {
  await CDN.uploadFolder('dist');
  await CDN.uploadFolder('public');
  await CDN.uploadFile('index.html');
})();
