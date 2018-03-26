'use strict'

const CDN = require('../lib/CDN')

const jsonFiles = [
  'json/version.json',
]

CDN.uploadFilesSync(jsonFiles).then(msg => console.log(msg))
