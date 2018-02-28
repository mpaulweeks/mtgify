'use strict'

const Config = require('./Config')

describe('Config module', () => {
  test('Config jas default', () => {
    expect(Config().apiUrl).toEqual('http://autocard.mpaulweeks.com')
  })
  test('Config loads current window state', () => {
    window.AUTOCARD_API = 'some_url'
    expect(Config().apiUrl).toEqual('some_url')
  })
})
