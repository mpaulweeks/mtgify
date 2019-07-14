'use strict'

const CDN = require('../lib/CDN')

CDN.uploadFolder('dist')
  .then(msg => console.log(msg))
  .then(() => CDN.uploadFile('test/index.html'))
  .then(msg => console.log(msg))
  .then(() => CDN.uploadFile('index.html'))
  .then(msg => console.log(msg))
  .then(() => CDN.uploadFolder('docs'))
  .then(msg => console.log(msg))
