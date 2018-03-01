'use strict'

const Config = require('./Config')

const CardAPI = new (class {
  constructor() {
    const self = this
    self.lookupInfo = new Promise((resolve, reject) => {
      self.resolveInfo = lookup => resolve(lookup)
    })
    window.fetch(`${Config().apiUrl}/json/CardInfo.lower.json`)
      .then(res => res.json())
      .then(lookup => self.resolveInfo(lookup))
  }
  normalizeCardName(cardName) {
    return cardName.trim().toLowerCase()
  }
  performLookup(lookup, cardName) {
    return lookup[this.normalizeCardName(cardName)]
  }
  getCardInfo(cardName) {
    const self = this
    return self.lookupInfo
      .then(lookup => self.performLookup(lookup, cardName))
      .then(card => {
        const gathererUrl = `http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.mid}&type=card`
        const mciUrl = card.mciSet && card.mciNum ? `https://magiccards.info/scans/en/${card.mciSet}/${card.mciNum}.jpg` : null
        const imgUrl = (
          Config().isTest ?
          'CardImage.jpg' :
          mciUrl || gathererUrl
        )
        return {
          ...card,
          imgUrl,
        }
      })
  }
})()

module.exports = CardAPI
