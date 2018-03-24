'use strict'

const Config = require('./Config')

describe('Config module', () => {
  test('Config has default values', () => {
    expect(Config().apiUrl).toEqual('https://mtgify.org')
  })
  test('Config loads current window state', () => {
    window.MTGIFY_CONFIG = {
      apiUrl: 'some_url',
    }
    expect(Config().apiUrl).toEqual('some_url')
  })
})
