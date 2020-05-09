'use strict'

const Constants = require('./Constants')
const Config = require('./Config')
const Compressor = require('./Compressor')
const TextParser = require('./TextParser')

function pad(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

class CardAPI {
  constructor(customConfig) {
    const self = this
    self.lookupPromise = new Promise((resolve, reject) => {
      self.resolveLookup = (version, cardData) => {
        const decompressed = Compressor.decompressArray(cardData)
        const lookup = self.createLookup(version, decompressed)
        resolve(lookup)
      }
    })
    const config = Config(customConfig)
    window.fetch(`${config.apiUrl}/json/version.json`, { cache: "no-store" })
      .then(resp => resp.json())
      .then(version => {
        // hacky fix for tests
        const date = version.date || new Date().toISOString();
        const v = date.slice(0, 10).split('-').join('');
        window.fetch(`${config.apiUrl}/json/CardInfo.compressed.json?v=${v}`)
          .then(res => res.json())
          .then(cardData => self.resolveLookup(version, cardData))
      })
  }
  getVersion() {
    return this.lookupPromise.then(lookup => lookup.version)
  }
  normalizeCardName(cardName, config) {
    let fixed = cardName.toLowerCase()
    fixed = fixed.split(`’`).join(`'`)
    fixed = fixed.split(`&#8217;`).join(`'`)
    if (config.trimWhitespace) {
      fixed = fixed.trim()
    }
    return fixed
  }
  performLookup(lookup, cardName, config) {
    return lookup.cards[this.normalizeCardName(cardName, config)] || null
  }
  createLookup(version, cardArray) {
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
      version: version,
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
      if (cardName.trim() !== card.name.trim()) {
        return null
      }
    }

    if (config.excludeUnsets && card.isUn) {
      return null
    }

    let imgUrl = null
    switch (config.imgSource) {
      case Constants.imgSource.magicCardsInfo:
      case Constants.imgSource.scryfall:
        // imgUrl = `https://api.scryfall.com/cards/multiverse/${card.mid}?format=image`
        imgUrl = `https://api.scryfall.com/cards/${card.setCode}/${card.cardNum}/${config.language}?format=image`
        break
      case Constants.imgSource.urzaCo:
        let paddedNum = pad(card.cardNum, 3);
        if (isNaN(paddedNum.slice(-1))) {
          paddedNum = pad(paddedNum, 4);
        }
        imgUrl = `https://s3.urza.co/cards/${card.setCode}/front/200dpi/${paddedNum}.jpg`;
        break
    }
    if (!imgUrl) {
      imgUrl = `https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.mid}&type=card`
    }
    imgUrl = config.testImagePath || imgUrl

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
    config.ignoreCase = true // necessary override for key matching
    return self.lookupPromise
      .then(lookup => {
        const keys = Object.keys(lookup.cards)
        let card = null
        while (card === null) {
          const randomIndex = Math.floor(Math.random() * keys.length)
          const cardName = keys[randomIndex]
          card = self.performLookup(lookup, cardName, config)
          card = self.attachCardMetaData(cardName, card, config)
        }
        return card
      })
  }
  renderAutoCard(card, config) {
    if (card === null) {
      return null
    }
    const node = document.createElement('auto-card')
    node.setAttribute('name', card.name)
    Constants.configAttrs.forEach(attr => {
      node.setAttribute(attr, config[attr])
    });
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
