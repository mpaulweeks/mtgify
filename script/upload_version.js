'use strict'

const MtgJson = require('../lib/MtgJson')
const CDN = require('../lib/CDN')

MtgJson.updateVersion().then(() => {

  const jsonFiles = [
    'json/version.json',
  ]

  CDN.uploadFilesSync(jsonFiles).then(msg => console.log(msg))

})
