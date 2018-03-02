'use strict'

const fs = require('fs')
const CardAPI = require('./CardAPI')

function mockFetchJson(result) {
  return () => new Promise((resolve, reject) => {
    resolve({
      json: () => result,
    })
  })
}

const CardApi = (() => {
  const jsonText = fs.readFileSync('./test/CardInfo.compressed.20180301.json', "utf8")
  window.fetch = mockFetchJson(JSON.parse(jsonText))
  return new CardAPI()
})()

module.exports = {
  CardApi,
}
