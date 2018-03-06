'use strict'

class Parser {
  constructor(cardApi){
    this.textParserPromise = cardApi.newTextParser({ignoreCase: false})

    const self = this
    document.addEventListener("DOMContentLoaded", function() {
      console.log('start search')
      self.searchBody()
    })
  }
  searchBody() {
    self.textParserPromise.then(tp => self.searchElement(tp, document.body))
  }
  searchElement(tp, elm) {
    if (elm.hasAttribute && elm.hasAttribute('no-autocard')){
      // todo skip auto-card tags
      // check for function, not all node types have it
      return
    }

    const self = this
    if (elm.nodeType === Node.TEXT_NODE){
      const text = elm.textContent.trim()
      if (text) {
        const result = tp.searchText(text)
        if (result.changed) {
          elm.textContent = result.newText
          /*
            https://stackoverflow.com/a/16662482/6461842
            node.parentNode.insertBefore(span, node.nextSibling);
          */
          const beforeNode = document.createTextNode('before')
          elm.parentNode.insertAfter(beforeNode, elm)
          const afterNode = document.createTextNode('after')
          elm.parentNode.insertAfter(afterNode, beforeNode)
          beforeNode.insertAdjacentHTML('afterend', result.cardTag)

          self.searchElement(elm.afterNode)
        }
      }
    } else {
      for(var ci = 0; ci < elm.childNodes.length; ci++){
        const childElm = elm.childNodes[ci]
        self.searchElement(tp, childElm)
      }
    }
    return ''
  }
}

module.exports = cardApi => new Parser(cardApi)
