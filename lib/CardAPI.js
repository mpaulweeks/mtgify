'use strict'

const CardAPI = new (class {
  constructor() {
    const self = this
    self.lookupInfo = new Promise((resolve, reject) => {
      self.resolveInfo = lookup => resolve(lookup)
    })
    self.isTest = window.location.pathname.includes('test')
    self.baseUrl = (
      self.isTest ?
      `${window.location.href}/../../` :
      'http://autocard.mpaulweeks.com'
    )
    fetch(`${self.baseUrl}/json/CardInfo.lower.json`)
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
        const imgUrl = (
          self.isTest ?
          'CardImage.jpg' :
          `http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.multiverseid}&type=card`
        )
        return {
          ...card,
          imgUrl,
        }
      })
  }
})()

module.exports = CardAPI
