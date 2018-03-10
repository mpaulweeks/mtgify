'use strict'

const gatherer = 'gatherer'
const comboDeck = 'comboDeck'
const urzaCo = 'urzaCo'
const magicCardsInfo = 'magicCardsInfo'
const scryfall = 'scryfall'

const imgSource = {
  gatherer: gatherer,
  urzaCo: urzaCo,
  magicCardsInfo: magicCardsInfo,
  scryfall: scryfall,
}

const linkSource = {
  gatherer: gatherer,
  comboDeck: comboDeck,
  urzaCo: urzaCo,
  magicCardsInfo: magicCardsInfo,
  scryfall: scryfall,
}

const displayName = {}
displayName[gatherer] = 'Gatherer'
displayName[comboDeck] = 'combodeck.net'
displayName[urzaCo] = 'urza.co'
displayName[magicCardsInfo] = 'magiccards.info'
displayName[scryfall] = 'scryfall.com'

module.exports = {
  displayName,
  imgSource,
  linkSource,
  imgSources: Object.keys(imgSource).map(imgKey => imgSource[imgKey]),
  linkSources: Object.keys(linkSource).map(linkKey => linkSource[linkKey]),
}
