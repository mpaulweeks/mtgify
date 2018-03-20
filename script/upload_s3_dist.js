'use strict'

const CDN = require('../lib/CDN')

const distFiles = [
  'dist/autocard.css',
  'dist/autocard.js',
  'dist/autocard.js.map',
]

CDN.uploadFilesSync(distFiles).then(msg => console.log(msg))
