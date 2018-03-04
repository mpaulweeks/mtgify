'use strict'

class Parser {
  constructor(cardApi) {
    this.strictNamesPromise = cardApi.getStrictNames()
  }
  checkForCard(cardName) {
    return this.strictNamesPromise
      .then(lookup => lookup[cardName] || false)
  }
}

module.exports = Parser
