'use strict'

const gatherer = 'gatherer'
const comboDeck = 'comboDeck'
const magicCardsInfo = 'magicCardsInfo'
const scryfall = 'scryfall'

const imgSource = {
  gatherer: gatherer,
  magicCardsInfo: magicCardsInfo,
  scryfall: scryfall,
}

const linkSource = {
  gatherer: gatherer,
  comboDeck: comboDeck,
  magicCardsInfo: magicCardsInfo,
  scryfall: scryfall,
}

const displayName = {}
displayName[gatherer] = 'Gatherer'
displayName[comboDeck] = 'combodeck.net'
displayName[magicCardsInfo] = 'magiccards.info'
displayName[scryfall] = 'scryfall.com'

module.exports = {
  displayName,
  imgSource,
  linkSource,
  imgSources: Object.keys(imgSource).map(imgKey => imgSource[imgKey]),
  linkSources: Object.keys(linkSource).map(linkKey => linkSource[linkKey]),
}
