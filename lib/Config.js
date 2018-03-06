'use strict'

const defaults = {
  ignoreCase: true,
  trimWhitespace: true,

  isTest: false,
  apiUrl: 'http://autocard.mpaulweeks.com',

  enableAutoTag: false,

  imgMagicCardsInfo: false,
  imgScryfall: false,
  linkMagicCardsInfo: false,
  linkScryfall: false,
  linkCombodeck: false,
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
