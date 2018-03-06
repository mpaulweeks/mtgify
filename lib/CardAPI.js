'use strict'

const Config = require('./Config')
const Compressor = require('./Compressor')
const TextParser = require('./TextParser')

class CardAPI {
  constructor() {
    const self = this
    self.lookupPromise = new Promise((resolve, reject) => {
      self.resolveLookup = cardData => {
        const decompressed = Compressor.decompressArray(cardData)
        const lookup = self.createLookup(decompressed)
        resolve(lookup)
      }
    })
    window.fetch(`${Config().apiUrl}/json/CardInfo.compressed.json`)
      .then(res => res.json())
      .then(cardData => self.resolveLookup(cardData))
  }
  normalizeCardName(cardName) {
    return cardName.trim().toLowerCase()
  }
  performLookup(lookup, cardName) {
    return lookup.lookup[this.normalizeCardName(cardName)] || null
  }
  performLookupStrict(lookup, cardName) {
    if (lookup.names.hasOwnProperty(cardName)){
      return this.performLookup(lookup, cardName)
    }
    return null
  }
  createLookup(cardArray) {
    const self = this
    const lookup = {}
    const names = {}
    cardArray.forEach(card => {
      lookup[self.normalizeCardName(card.name)] = card
      names[card.name] = true
    })
    return {
      names: names,
      lookup: lookup,
    }
  }
  attachCardMetaData(cardName, card, customConfig) {
    if (card === null) {
      return null
    }

    const config = Config(customConfig)
    if (!config.ignoreCase) {
      if (cardName.trim() !== card.name.trim()){
        return null
      }
    }

    const imgMagicCardsInfo = (card.mciSet && card.mciNum) ? `https://magiccards.info/scans/en/${card.mciSet}/${card.mciNum}.jpg` : null
    const imgScryfall = (card.mciSet && card.mciNum) ? `https://img.scryfall.com/cards/normal/en/${card.mciSet}/${card.mciNum}.jpg` : null
    const imgWotcUrl = `http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.mid}&type=card`
    const imgUrl = (
      config.isTest ?
      'CardImage.jpg' :
      (config.imgMagicCardsInfo && imgMagicCardsInfo) || (config.imgScryfall && imgScryfall) || imgWotcUrl
    )

    return {
      ...card,
      imgUrl,
    }
  }
  getCardInfo(cardName, customConfig) {
    const self = this
    return self.lookupPromise
      .then(lookup => self.performLookup(lookup, cardName))
      .then(card => self.attachCardMetaData(cardName, card, customConfig))
  }
  renderAutoCard(card) {
    if (card === null){
      return null
    }
    const node = document.createElement('card-text')
    node.setAttribute('name', card.name)
    return node
  }
  newTextParser(customConfig) {
    const self = this
    return this.lookupPromise
      .then(lookup => {
        const verifier = cardName => {
          const card = self.performLookup(lookup, cardName)
          const info = self.attachCardMetaData(cardName, card, customConfig)
          return self.renderAutoCard(info)
        }
        return new TextParser(verifier)
      })
  }
}

module.exports = () => new CardAPI()
