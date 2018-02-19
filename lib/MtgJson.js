'use strict'

const fetch = require('node-fetch')
const convert = require('xml-to-json-promise')

class Version {
  constructor(version, updated){
    this.version = version
    this.updated = updated
  }
  isUpdate(otherVersion){
    return this.updated > otherVersion.updated
  }
  toJSON() {
    return JSON.stringify({
      version: this.version,
      updated: this.updated,
    })
  }
}

function versionFromJSON(jsonText){
  const jsonObj = JSON.parse(jsonText)
  return new Version(jsonObj.version, jsonObj.updated)
}

function parseRSS(text) {
  return convert.xmlDataToJSON(text)
    .then(data => {
      const feed = data.feed
      const updated = feed.updated[0]
      const latestTitle = feed.entry[0].title[0]
      const version = latestTitle.split('Version ')[1]
      return new Version(version, updated)
    })
}

function fetchVersion() {
  return fetch('https://mtgjson.com/atom.xml')
    .then(res => res.text())
    .then(parseRSS)
}

module.exports = {
  Version,
  versionFromJSON,
  fetchVersion,
}
