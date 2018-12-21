'use strict'

const fetch = require('node-fetch')
const fs = require('fs')
const unzip = require('unzip')
const JSONStream = require('JSONStream')
const es = require('event-stream')

const Compressor = require('./Compressor')

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
  return new Version(jsonObj.version, jsonObj.date)
}

function fetchVersion() {
  return fetch('https://mtgjson.com/json/version.json')
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

function writeJsonFile(fileName, obj) {
  console.log('writing', fileName)
  return new Promise((resolve, reject) => {
    fs.writeFile('./json/' + fileName, JSON.stringify(obj), 'utf8', resolve)
  })
}

function generateAllCustomJson(){
  const EXCLUDED_SETS_TYPES = [
    "promo",
    "masterpiece",
    "duel deck",
  ]
  const EXCLUDED_CARD_TYPES = [
    "Vanguard",
    "Scheme",
    "Ongoing Scheme",
  ]
  const MERGE_LAYOUTS = [
    "split",
    "aftermath",
  ]
  const cardInfo = {}
  const mids = {}
  const midsLower = {}
  const handler = set => {
    if (!EXCLUDED_SETS_TYPES.includes(set.type)) {
      set.cards.forEach(card => {
        if (EXCLUDED_CARD_TYPES.includes(card.type)) {
          return
        }
        const mid = card.multiverseid
        if (!mid){
          return
        }
        const midInt = parseInt(card.multiverseid)
        let cardName = card.name
        if (card.names && MERGE_LAYOUTS.includes(card.layout)){
          // merged split/aftermath cards, not flip/double/meld cards
          cardName = card.names.join(' / ')
        }
        const key = cardName.toLowerCase()
        const oldCard = cardInfo[key]
        if (oldCard && !card.mciNumber){
          // if card already exists and this is missing info, pass
          return
        }
        if (!oldCard || !oldCard.mciNum || midInt > oldCard.mid){
          // if card doesn't exist, lacks info, or is older, continue
          cardInfo[key] = {
            mid: midInt,
            name: cardName,
            types: card.types,
            cmc: card.cmc,
            isUn: set.type === 'un',
            setCode: set.code.toLowerCase(),
            cardNum: card.number,
            mciSet: set.magicCardsInfoCode,
            mciNum: card.mciNumber,
          }
          mids[cardName] = midInt
          midsLower[key] = midInt
        }
      })
    }
  }
  console.log('generating json objs')
  const stream = fs.createReadStream('./json/AllSets.json', {encoding: 'utf8'})
  stream
    .pipe(JSONStream.parse([true]))
    .pipe(es.mapSync(handler))
  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      console.log('generating CardInfo.compressed.json')
      const compressed = Compressor.compressArray(Object.values(cardInfo))
      writeJsonFile('CardInfo.lower.json', cardInfo)
        .then(() => writeJsonFile('CardInfo.compressed.json', compressed))
        .then(() => writeJsonFile('Multiverse.json', mids))
        .then(() => writeJsonFile('Multiverse.lower.json', midsLower))
        .then(resolve)
    })
  })
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
