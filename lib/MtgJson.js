'use strict'

const fetch = require('node-fetch')
const fs = require('fs')
const unzip = require('unzip')
const JSONStream = require('JSONStream')
const es = require('event-stream')

class Version {
  constructor(version, updated){
    // trim the Z off the end to match expected format
    this.updated = updated || new Date().toISOString().slice(0, -1)
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
      updated: this.updated,
      version: this.version,
    })
  }
}

function versionFromJSON(jsonObj){
  return new Version(jsonObj.version, jsonObj.updated)
}

function fetchVersion() {
  return fetch('https://mtgjson.com/json/version-full.json')
    .then(res => res.json())
    .then(data => versionFromJSON(data))
}

function loadLocalVersion() {
  try {
    var content = fs.readFileSync('./json/version.json')
    return versionFromJSON(JSON.parse(content))
  } catch(err) {
    console.log("no local version")
    return null;
  }
}

function saveVersion(version){
  console.log("saving local version", version.toJSON())
  return new Promise((resolve, reject) => {
    fs.writeFile('./json/version.json', version.toJSON(), 'utf8', resolve)
  })
}

function updateVersion(){
  return fetchVersion()
    .then(remoteVersion => {
      const localVersion = loadLocalVersion()
      saveVersion(remoteVersion)
      const needsUpdate = remoteVersion.isUpdate(localVersion)
      return needsUpdate
    })
}

function fetchJsonZip(jsonFile){
  return fetch(`https://mtgjson.com/json/${jsonFile}.zip`)
}

function downloadJsonUnzip(jsonFile){
  return fetchJsonZip(jsonFile)
    .then(res => new Promise((resolve, reject) => {
      const stream = res.body.pipe(unzip.Extract({ path: './json/' }))
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

function downloadJsonUnzipBulkSync(allFiles){
  function getNext(fileIndex) {
    if (fileIndex < allFiles.length){
      return downloadJsonUnzip(allFiles[fileIndex])
        .then(newPromise => getNext(fileIndex + 1))
    } else {
      return new Promise((resolve, reject) => resolve())
    }
  }
  return getNext(0)
}

function generateMultiverseJson(){
  const mids = {}
  const midsLower = {}
  const handler = card => {
    const mid = card.multiverseid
    if (mid){
      const oldMid = mids[card.name]
      if (!oldMid || mid > oldMid){
        mids[card.name] = mid
        midsLower[card.name.toLowerCase()] = mid
      }
    }
    return card
  }
  console.log('generating Multiverse.json')
  console.log('generating Multiverse.lower.json')
  const stream = fs.createReadStream('./json/AllSets.json', {encoding: 'utf8'})
  stream
    .pipe(JSONStream.parse([true, 'cards', true]))
    .pipe(es.mapSync(handler))
  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      console.log('writing Multiverse.json')
      fs.writeFile('./json/Multiverse.json', JSON.stringify(mids), 'utf8', () => {
        console.log('writing Multiverse.lower.json')
        fs.writeFile('./json/Multiverse.lower.json', JSON.stringify(midsLower), 'utf8', resolve)
      })
    })
  })
}

function generateAllCardsLowerJson(){
  const lookup = {}
  const handler = card => {
    lookup[card.name.toLowerCase()] = card
    return card
  }
  console.log('generating AllCards.lower.json')
  const stream = fs.createReadStream('./json/AllCards.json', {encoding: 'utf8'})
  stream
    .pipe(JSONStream.parse([true]))
    .pipe(es.mapSync(handler))
  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      console.log('writing AllCards.lower.json')
      fs.writeFile('./json/AllCards.lower.json', JSON.stringify(lookup), 'utf8', resolve)
    })
  })
}

function generateCardInfoLowerJson(){
  const lookup = {}
  const handler = card => {
    const mid = card.multiverseid
    if (mid){
      const key = card.name.toLowerCase()
      const oldCard = lookup[key]
      if (!oldCard || mid > oldCard.mid){
        lookup[key] = {
          mid: mid,
          name: card.name,
          types: card.types,
          cmc: card.cmc,
        }
      }
    }
    return card
  }
  console.log('generating CardInfo.lower.json')
  const stream = fs.createReadStream('./json/AllSets.json', {encoding: 'utf8'})
  stream
    .pipe(JSONStream.parse([true, 'cards', true]))
    .pipe(es.mapSync(handler))
  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      console.log('writing CardInfo.lower.json')
      fs.writeFile('./json/CardInfo.lower.json', JSON.stringify(lookup), 'utf8', resolve)
    })
  })
}


function generateAllCustomJson(){
  return generateAllCardsLowerJson()
    .then(() => generateMultiverseJson())
    .then(() => generateCardInfoLowerJson())
}
function tryGenerateAllCustomJson(needsUpdate){
  return new Promise((resolve, reject) => {
    if (needsUpdate){
      generateAllCustomJson()
        .then(() => resolve(needsUpdate))
    } else {
      resolve(needsUpdate)
    }
  })
}

const allFiles = [
  'AllCards.json',
  'AllCards-x.json',
  'AllSets.json',
  'AllSets-x.json',
]
function tryScrape(){
  return updateVersion()
    .then(needsUpdate => {
      const promises = needsUpdate ? allFiles.map(downloadJsonUnzip) : []
      return Promise.all(promises)
        .then(() => needsUpdate)
    })
    .then(needsUpdate => tryGenerateAllCustomJson(needsUpdate))
}
function tryScrapeSync(){
  return updateVersion()
    .then(needsUpdate => {
      const todoFiles = needsUpdate ? allFiles : []
      return downloadJsonUnzipBulkSync(todoFiles)
        .then(() => needsUpdate)
    })
    .then(needsUpdate => tryGenerateAllCustomJson(needsUpdate))
}

module.exports = {
  test: {
    Version,
    versionFromJSON,
  },
  tryScrape,
  tryScrapeSync,
  generateAllCustomJson,
}
