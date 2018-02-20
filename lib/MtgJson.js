'use strict'

const fetch = require('node-fetch')
const fs = require('fs')
const unzip = require('unzip')

class Version {
  constructor(version){
    this.version = version
  }
  major(){
    return parseInt(this.version.split('.')[0], 10);
  }
  minor(){
    return parseInt(this.version.split('.')[1], 10);
  }
  patch(){
    return parseInt(this.version.split('.')[2], 10);
  }
  isUpdate(otherVersion){
    return (
      this.major() > otherVersion.major() ||
      this.major() === otherVersion.major() && this.minor() > otherVersion.minor() ||
      this.major() === otherVersion.major() && this.minor() === otherVersion.minor() && this.patch() > otherVersion.patch()
    );
  }
  toJSON() {
    return JSON.stringify({
      version: this.version,
    })
  }
}

function versionFromJSON(jsonObj){
  return new Version(jsonObj.version)
}

function fetchVersion() {
  return fetch('https://mtgjson.com/json/version-full.json')
    .then(res => res.json())
    .then(data => versionFromJSON(data))
}

const allFiles = [
  'AllCards.json',
  'AllCards-x.json',
  'AllSets.json',
  'AllSets-x.json',
]

function downloadJsonZip(jsonFile){
  return fetch(`https://mtgjson.com/json/${jsonFile}.zip`)
}

function downloadJsonUnzip(jsonFile){
  return downloadJsonZip(jsonFile)
    .then(res => new Promise((resolve, reject) => {
      const stream = res.body.pipe(unzip.Extract({ path: './scrape_out/json/' }))
      stream.on('finish', () => {
        resolve({
          jsonFile: jsonFile,
        })
      })
    }))
    .catch(res => {
      console.log('failed to fetch and unzip', res)
    })
}

function tryScrape(){
  const promises = allFiles.map(downloadJsonUnzip)
  return Promise.all(promises)
}

module.exports = {
  Version,
  versionFromJSON,
  fetchVersion,
  tryScrape,
}
