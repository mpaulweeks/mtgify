'use strict'

const gatherer = 'gatherer'
const comboDeck = 'comboDeck'
const urzaCo = 'urzaCo'
const scryfall = 'scryfall'
const magicCardsInfo = 'magicCardsInfo' // deprecated

const configAttrs = [
  'imgSource',
  'linkSource',
  'language',
]

const imgSource = {
  gatherer: gatherer,
  urzaCo: urzaCo,
  scryfall: scryfall,
  magicCardsInfo: magicCardsInfo, // deprecated
}

const linkSource = {
  gatherer: gatherer,
  comboDeck: comboDeck,
  urzaCo: urzaCo,
  scryfall: scryfall,
  magicCardsInfo: magicCardsInfo, // deprecated
}

const partners = [
  comboDeck,
  urzaCo,
  scryfall,
]

const displayName = {}
displayName[gatherer] = 'Gatherer'
displayName[comboDeck] = 'combodeck.net'
displayName[urzaCo] = 'urza.co'
displayName[scryfall] = 'scryfall.com'

const displayUrls = {}
displayUrls[gatherer] = 'https://gatherer.wizards.com'
displayUrls[comboDeck] = 'http://combodeck.net'
displayUrls[urzaCo] = 'https://urza.co'
displayUrls[scryfall] = 'https://scryfall.com'

const deprecated = [
  magicCardsInfo,
]

module.exports = {
  configAttrs,
  displayName,
  displayUrls,
  imgSource,
  linkSource,
  partners,
  imgSources: Object.keys(imgSource).map(imgKey => imgSource[imgKey]).filter(src => !deprecated.includes(src)),
  linkSources: Object.keys(linkSource).map(linkKey => linkSource[linkKey]).filter(src => !deprecated.includes(src)),
}
