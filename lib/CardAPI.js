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
    const config = Config(customConfig)
    return self.lookupPromise
      .then(lookup => self.performLookup(lookup, cardName, config))
      .then(card => self.attachCardMetaData(cardName, card, config))
  }
  renderAutoCard(card) {
    if (card === null){
      return null
    }
    const node = document.createElement('auto-card')
    node.setAttribute('name', card.name)
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
          return self.renderAutoCard(info)
        }
        const maxLength = config.excludeUnsets ? lookup.longestName.length : lookup.longestUnName.length
        return new TextParser(verifier, maxLength)
      })
  }
}

module.exports = () => new CardAPI()
