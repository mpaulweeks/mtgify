'use strict'

class Parser {
  constructor(cardApi){
    this.textParserPromise = cardApi.newTextParser()
  }
  replaceTextWithCards(innerText) {
    return this.textParserPromise
      .then(textParser => {
        return textParser.searchText(innerText)
      })
  }
}

module.exports = cardApi => new Parser(cardApi)
