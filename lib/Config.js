'use strict'

const Config = env => {
  env = env || window
  return {
    isTest: env.AUTOCARD_TEST || false,
    apiUrl: env.AUTOCARD_API || 'http://autocard.mpaulweeks.com',
  }
}

module.exports = Config
