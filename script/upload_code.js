const CDN = require('../lib/CDN');

(async () => {
  await CDN.uploadFolder('dist');
  await CDN.uploadFile('index.html');
  await CDN.uploadFolder('public');
})()
