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
    const self = this
    self.textParserPromise.then(tp => self.searchElement(tp, document.body))
  }
  searchElement(tp, elm) {
    if (elm.hasAttribute && elm.hasAttribute('no-autocard')){
      // check for function, not all node types have it
      return
    }
    const self = this
    if (elm.nodeType === Node.TEXT_NODE){
      const text = elm.textContent.trim()
      if (text) {
        const result = tp.replaceFirst(text)
        if (result.changed) {
          console.log('parser found change', text, result)
          /*
            https://stackoverflow.com/a/16662482/6461842
            node.parentNode.insertBefore(span, node.nextSibling);
          */
          const nextSibling = elm.nextSibling
          const beforeNode = document.createTextNode(result.beforeText)
          elm.parentNode.insertBefore(beforeNode, nextSibling)

          // beforeNode.insertAdjacentHTML('afterend', result.newHTML)
          elm.parentNode.insertBefore(result.newHTML, nextSibling)

          const afterNode = document.createTextNode(result.afterText)
          elm.parentNode.insertBefore(afterNode, nextSibling)

          elm.remove()

          self.searchElement(tp, afterNode)
        }
      }
    } else {
      if (elm.tagName.toLowerCase().includes('card-')){
        // skip autocard tags
        return
      }
      for(var ci = 0; ci < elm.childNodes.length; ci++){
        const childElm = elm.childNodes[ci]
        self.searchElement(tp, childElm)
      }
    }
    return ''
  }
}

module.exports = cardApi => new Parser(cardApi)
