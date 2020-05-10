'use strict'

const fetch = require('node-fetch')
const fs = require('fs')
const unzip = require('unzip')
const JSONStream = require('JSONStream')
const es = require('event-stream')

const Compressor = require('./Compressor')

class Version {
  constructor(version, date, updated) {
    this.version = version
    this.date = date
    // trim the Z off the end to match expected format
    this.updated = updated || new Date().toISOString().slice(0, -1)
  }
  isDifferent(otherVersion) {
    return this.version !== otherVersion.version
  }
  toJSON() {
    return JSON.stringify({
      updated: this.updated,
      version: this.version,
      date: this.date,
    })
  }
}

function versionFromJSON(jsonObj) {
  return new Version(jsonObj.version, jsonObj.date, null)
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
  } catch (err) {
    console.log("no local version")
    return null;
  }
}

function saveVersion(version) {
  console.log("saving local version", version.toJSON())
  return new Promise((resolve, reject) => {
    fs.writeFile('./json/version.json', version.toJSON(), 'utf8', resolve)
  })
}

function checkVersion() {
  return fetchVersion()
    .then(remoteVersion => {
      const localVersion = loadLocalVersion()
      const needsUpdate = remoteVersion.isDifferent(localVersion)
      return needsUpdate
    })
}
function updateVersion() {
  return fetchVersion()
    .then(remoteVersion => {
      saveVersion(remoteVersion)
    })
}

function fetchJsonZip(jsonFileName) {
  const url = `https://mtgjson.com/json/${jsonFileName}.zip`
  console.log('downloading zip:', url);
  return fetch(url)
}

function downloadJsonUnzip(jsonFileName) {
  return fetchJsonZip(jsonFileName)
    .then(res => new Promise((resolve, reject) => {
      const stream = res.body.pipe(unzip.Extract({ path: './json/' }))
      stream.on('finish', () => {
        console.log('unzipped', jsonFileName)
        resolve({
          jsonFileName: jsonFileName,
        })
      })
    }))
    .catch(res => {
      console.log('failed to fetch and unzip', res)
    })
}

function downloadJsonUnzipBulkSync(allFiles) {
  const promises = [];
  function getNext(fileIndex) {
    if (fileIndex < allFiles.length) {
      return downloadJsonUnzip(allFiles[fileIndex])
        .then(newPromise => {
          promises.push(newPromise)
          return getNext(fileIndex + 1)
        })
    } else {
      return new Promise((resolve, reject) => resolve(promises))
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

function generateAllCustomJson() {
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
        if (!card.multiverseId) {
          return
        }
        const midInt = parseInt(card.multiverseId)
        let cardName = card.name
        if (card.names && MERGE_LAYOUTS.includes(card.layout)) {
          // merged split/aftermath cards, not flip/double/meld cards
          cardName = card.names.join(' / ')
        }
        const key = cardName.toLowerCase()
        const oldCard = cardInfo[key]
        if (oldCard) {
          // if card already exists and this is missing info, pass
          return
        }
        if (!oldCard || midInt > oldCard.mid) {
          // if card doesn't exist, lacks info, or is older, continue
          cardInfo[key] = {
            mid: midInt,
            name: cardName,
            types: card.types,
            cmc: card.convertedManaCost,
            isUn: set.type === 'un',
            setCode: set.code.toLowerCase(),
            cardNum: card.number,
          }
          mids[cardName] = midInt
          midsLower[key] = midInt
        }
      })
    }
  }
  console.log('generating json objs')
  const stream = fs.createReadStream('./json/AllPrintings.json', { encoding: 'utf8' })
  stream
    .pipe(JSONStream.parse([true]))
    .pipe(es.mapSync(handler))
  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      console.log('generating CardInfo.compressed.json')
      if (Object.keys(cardInfo).length === 0) {
        throw new Error('cardInfo is empty! something went wrong')
      }
      const compressed = Compressor.compressArray(Object.values(cardInfo))
      writeJsonFile('CardInfo.lower.json', cardInfo)
        .then(() => writeJsonFile('CardInfo.compressed.json', compressed))
        .then(() => writeJsonFile('Multiverse.json', mids))
        .then(() => writeJsonFile('Multiverse.lower.json', midsLower))
        .then(resolve)
    })
  })
}

const allFiles = [
  'AllSets.json',
]
function scrapeJson() {
  const promises = allFiles.map(downloadJsonUnzip)
  return Promise.all(promises)
}
function scrapeJsonSync() {
  const todoFiles = allFiles
  return downloadJsonUnzipBulkSync(todoFiles)
}

module.exports = {
  test: {
    Version,
    versionFromJSON,
  },
  checkVersion,
  updateVersion,
  scrapeJson,
  scrapeJsonSync,
  generateAllCustomJson,
}
