'use strict'

const defaults = {
  ignoreCase: true,
  isTest: false,
  apiUrl: 'http://autocard.mpaulweeks.com',
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
