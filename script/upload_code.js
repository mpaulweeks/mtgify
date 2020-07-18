'use strict'

const CDN = require('../lib/CDN')

CDN.uploadFolder('dist')
  .then(msg => console.log(msg))
  .then(() => CDN.uploadFile('test/index.html'))
  .then(msg => console.log(msg))
  .then(() => CDN.uploadFile('index.html'))
  .then(msg => console.log(msg))
  .then(() => CDN.uploadFolder('public'))
  .then(msg => console.log(msg))
