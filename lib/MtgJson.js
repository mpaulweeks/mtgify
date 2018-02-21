'use strict'

const fetch = require('node-fetch')
const fs = require('fs')
const unzip = require('unzip')
const JSONStream = require('JSONStream')
const es = require('event-stream')

class Version {
  constructor(version){
    this.version = version
  }
  major(){
    return parseInt(this.version.split('.')[0], 10)
  }
  minor(){
    return parseInt(this.version.split('.')[1], 10)
  }
  patch(){
    return parseInt(this.version.split('.')[2], 10)
  }
  isUpdate(otherVersion){
    return (
      otherVersion === null ||
      this.major() > otherVersion.major() ||
      this.major() === otherVersion.major() && this.minor() > otherVersion.minor() ||
      this.major() === otherVersion.major() && this.minor() === otherVersion.minor() && this.patch() > otherVersion.patch()
    )
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

function loadLocalVersion() {
  try {
    var content = fs.readFileSync('./scrape_out/version.json')
    return versionFromJSON(JSON.parse(content))
  } catch(err) {
    console.log("no local version")
    return null;
  }
}

function saveVersion(version){
  console.log("saving local version", version.toJSON())
  return new Promise((resolve, reject) => {
    fs.writeFile('./scrape_out/version.json', version.toJSON(), 'utf8', resolve)
  })
}

function updateVersion(){
  return fetchVersion()
    .then(remoteVersion => {
      const localVersion = loadLocalVersion()
      const needsUpdate = remoteVersion.isUpdate(localVersion)
      if (needsUpdate) {
        saveVersion(remoteVersion)
      }
      return needsUpdate
    })
}

const allFiles = [
  'AllCards.json',
  'AllCards-x.json',
  'AllSets.json',
  'AllSets-x.json',
]

function fetchJsonZip(jsonFile){
  return fetch(`https://mtgjson.com/json/${jsonFile}.zip`)
}

function downloadJsonUnzip(jsonFile){
  return fetchJsonZip(jsonFile)
    .then(res => new Promise((resolve, reject) => {
      const stream = res.body.pipe(unzip.Extract({ path: './scrape_out/json/' }))
      stream.on('finish', () => {
        console.log('unzipped', jsonFile)
        resolve({
          jsonFile: jsonFile,
        })
      })
    }))
    .catch(res => {
      console.log('failed to fetch and unzip', res)
    })
}

function generateMultiverseJson(){
  const stream = fs.createReadStream('./scrape_out/json/AllSets.json', {encoding: 'utf8'})
  const parser = JSONStream.parse('*')

  const mids = {}
  const midsLower = {}
  let count = 0
  const handler = data => {
    const card = data
    const mid = card.multiverseid
    if (mid && !mids[card.name]){
      count += 1
      if (count % 1000 === 0){
        console.log(count, card.name, card.multiverseid)
      }
      mids[card.name] = mid
      midsLower[card.name.toLowerCase()] = mid
    }
    return data
  }
  stream
    .pipe(JSONStream.parse([true, 'cards', true]))
    .pipe(es.mapSync(handler))
  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      console.log('done creating mids, now trying to write')
      fs.writeFile('./scrape_out/json/Multiverse.json', JSON.stringify(mids), 'utf8', () => {
        fs.writeFile('./scrape_out/json/Multiverse.lower.json', JSON.stringify(midsLower), 'utf8', resolve)
      })
    })
  })
}

function tryScrape(){
  return updateVersion()
    .then(needsUpdate => {
      const promises = needsUpdate ? allFiles.map(downloadJsonUnzip) : []
      return new Promise((resolve, reject) => {
        Promise.all(promises)
          .then(() => resolve(needsUpdate))
      })
    })
    .then(needsUpdate => {
      return new Promise((resolve, reject) => {
        if (needsUpdate){
          generateMultiverseJson()
            .then(() => resolve(needsUpdate))
        } else {
          resolve(needsUpdate)
        }
      })
    })
}

module.exports = {
  Version,
  versionFromJSON,
  fetchVersion,
  tryScrape,
  generateMultiverseJson,
}
