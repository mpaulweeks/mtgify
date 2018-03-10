'use strict'

const Constants = require('./Constants')
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
  normalizeCardName(cardName, config) {
    let fixed = cardName.toLowerCase()
    if (config.trimWhitespace){
      fixed = fixed.trim()
    }
    return fixed
  }
  performLookup(lookup, cardName, config) {
    return lookup.cards[this.normalizeCardName(cardName, config)] || null
  }
  createLookup(cardArray) {
    const self = this
    const config = Config()
    const lookup = {}
    let longestName = ''
    let longestUnName = ''
    cardArray.forEach(card => {
      lookup[self.normalizeCardName(card.name, config)] = card
      if (!card.isUn && card.name.length > longestName.length) {
        longestName = card.name
      }
      if (card.isUn && card.name.length > longestUnName.length) {
        longestUnName = card.name
      }
    })
    return {
      cards: lookup,
      longestName,
      longestUnName,
    }
  }
  attachCardMetaData(cardName, card, config) {
    if (card === null) {
      return null
    }

    if (!config.ignoreCase) {
      if (cardName.trim() !== card.name.trim()){
        return null
      }
    }

    if (config.excludeUnsets && card.isUn) {
      return null
    }

    let imgUrl = null
    switch (config.imgSource) {
      case Constants.imgSource.magicCardsInfo:
        imgUrl = card.mciSet && card.mciNum && `https://magiccards.info/scans/en/${card.mciSet}/${card.mciNum}.jpg`
      case Constants.imgSource.scryfall:
        imgUrl = card.mciNum && `https://img.scryfall.com/cards/normal/en/${card.setCode}/${card.mciNum}.jpg`
      case Constants.imgSource.urzaCo:
        imgUrl = card.mciNum && `https://s3.urza.co/cards/${card.setCode}/front/200dpi/${card.mciNum}.jpg`
    }
    if (!imgUrl){
      imgUrl = `http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.mid}&type=card`
    }
    imgUrl = config.isTest ? 'CardImage.jpg' : imgUrl

    return {
      ...card,
      imgUrl,
    }
  }
  getCardInfo(cardName, customConfig) {
    const self = this
    const config = Config(customConfig)
    return self.lookupPromise
      .then(lookup => self.performLookup(lookup, cardName, config))
      .then(card => self.attachCardMetaData(cardName, card, config))
  }
  getRandomCard(customConfig) {
    const self = this
    const config = Config(customConfig)
    return self.lookupPromise
      .then(lookup => {
        const keys = Object.keys(lookup.cards)
        let card = null
        while(card === null) {
          const randomIndex = Math.floor(Math.random() * keys.length)
          const cardName = keys[randomIndex]
          card = self.performLookup(lookup, cardName, config)
          card = self.attachCardMetaData(cardName, card, config)
        }
        return card
      })
  }
  renderAutoCard(card, config) {
    if (card === null){
      return null
    }
    const node = document.createElement('auto-card')
    node.setAttribute('name', card.name)
    node.setAttribute('imgSource', config.imgSource)
    node.setAttribute('linkSource', config.linkSource)
    return node
  }
  newTextParser(customConfig) {
    const self = this
    const config = Config(customConfig)
    return this.lookupPromise
      .then(lookup => {
        const verifier = cardName => {
          const card = self.performLookup(lookup, cardName, config)
          const info = self.attachCardMetaData(cardName, card, config)
          return self.renderAutoCard(info, config)
        }
        const maxLength = config.excludeUnsets ? lookup.longestName.length : lookup.longestUnName.length
        return new TextParser(verifier, maxLength)
      })
  }
}

module.exports = () => new CardAPI()
