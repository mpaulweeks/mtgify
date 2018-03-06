'use strict'

const fs = require('fs')
const CardApiFactory = require('./CardAPI')

function mockFetchJson(result) {
  return () => new Promise((resolve, reject) => {
    resolve({
      json: () => result,
    })
  })
}

const CardApi = (() => {
  const jsonText = fs.readFileSync('./test/CardInfo.compressed.20180306.json', "utf8")
  window.fetch = mockFetchJson(JSON.parse(jsonText))
  return CardApiFactory()
})()

module.exports = {
  CardApi,
}
