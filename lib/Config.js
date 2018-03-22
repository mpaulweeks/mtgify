'use strict'

const Constants = require('./Constants')

const defaults = {
  testImagePath: null,
  apiUrl: 'http://s3.amazonaws.com/s3.magicautocard.info',

  ignoreCase: true,
  trimWhitespace: true,
  excludeUnsets: false,

  enableAutoTag: false,

  imgSource: Constants.imgSource.gatherer,
  linkSource: Constants.linkSource.gatherer,
}

const Config = config => {
  const windowConfig = window.AUTOCARD_CONFIG || {}
  const customConfig = config || {}
  return {
    ...defaults,
    ...windowConfig,
    ...customConfig,
  }
}

module.exports = Config
