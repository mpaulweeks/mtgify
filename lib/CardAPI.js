'use strict'

const Config = require('./Config')
const Compressor = require('./Compressor')

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
    return lookup[this.normalizeCardName(cardName)]
  }
  createLookup(cardArray) {
    const self = this
    const lookup = {}
    cardArray.forEach(card => {
      lookup[self.normalizeCardName(card.name)] = card
    })
    return lookup
  }
  getCardInfo(cardName) {
    const self = this
    return self.lookupPromise
      .then(lookup => self.performLookup(lookup, cardName))
      .then(card => {
        const imgWotcUrl = `http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.mid}&type=card`
        const imgMciUrl = card.mciSet && card.mciNum ? `https://magiccards.info/scans/en/${card.mciSet}/${card.mciNum}.jpg` : null
        const imgUrl = (
          Config().isTest ?
          'CardImage.jpg' :
          (Config().useMci ? imgMciUrl || imgWotcUrl : imgWotcUrl)
        )
        return {
          ...card,
          imgUrl,
          imgMciUrl,
          imgWotcUrl,
        }
      })
  }
}

module.exports = CardAPI
