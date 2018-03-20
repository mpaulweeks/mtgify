'use strict'

const CDN = require('../lib/CDN')

const jsonFiles = [
  'json/CardInfo.compressed.json',
  'json/version.json',
]

CDN.uploadFilesSync(jsonFiles).then(msg => console.log(msg))
