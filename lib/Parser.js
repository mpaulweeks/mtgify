'use strict'

class Parser {
  constructor(cardApi){
    this.textParserPromise = cardApi.newTextParser()

    const self = this
    document.addEventListener("DOMContentLoaded", function() {
      console.log('start search')
      self.searchElement(document.body)
    })
  }
  searchElement(elm) {
    if (elm.hasAttribute && elm.hasAttribute('no-autocard')){
      // check for function, not all node types have it
      return
    }
    if (elm.nodeType === Node.TEXT_NODE){
      const text = elm.textContent.trim()
      if (text) {
        console.log(text)
      }
    } else {
      const self = this
      for(var ci = 0; ci < elm.childNodes.length; ci++){
        const childElm = elm.childNodes[ci]
        self.searchElement(childElm)
      }
    }
  }
  replaceTextWithCards(innerText) {
    return this.textParserPromise
      .then(textParser => {
        return textParser.searchText(innerText)
      })
  }
}

module.exports = cardApi => new Parser(cardApi)
