'use strict'

const defaults = {
  isTest: false,
  apiUrl: 'http://autocard.mpaulweeks.com',
  useMci: false,
}

const Config = env => {
  env = env || window
  const userSet = env.AUTOCARD_CONFIG || {}
  return {
    ...defaults,
    ...userSet,
  }
}

module.exports = Config
