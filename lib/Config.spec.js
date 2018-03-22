'use strict'

const Config = require('./Config')

describe('Config module', () => {
  test('Config has default values', () => {
    expect(Config().apiUrl).toEqual('https://s3.amazonaws.com/s3.magicautocard.info')
  })
  test('Config loads current window state', () => {
    window.AUTOCARD_CONFIG = {
      apiUrl: 'some_url',
    }
    expect(Config().apiUrl).toEqual('some_url')
  })
})
