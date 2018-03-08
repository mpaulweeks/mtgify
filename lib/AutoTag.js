'use strict'

class AutoTag {
  constructor(cardApi){
    this.cardApi = cardApi
  }
  tagBody(customConfig) {
    return this.tagElement(document.body, customConfig)
  }
  tagElement(elm, customConfig) {
    console.log('searching text for card names...')

    customConfig = customConfig || {}
    const config = {
      ignoreCase: false,
      trimWhitespace: false,
      excludeUnsets: true,
      ...customConfig,
    }

    const self = this
    return self.cardApi.newTextParser(config).then(tp => {
      self._searchElement(tp, elm)
      console.log('done searching')
      return 'todo'
    })
  }
  _searchElement(tp, elm) {
    if (elm.hasAttribute && elm.hasAttribute('auto-card-off')){
      // check for function, not all node types have it
      return
    }
    if (elm.tagName && elm.tagName.toLowerCase().includes('auto-card')){
      // skip autocard tags
      return
    }
    const self = this
    if (elm.nodeType === Node.TEXT_NODE){
      const text = elm.textContent
      if (text) {
        const result = tp.replaceFirst(text)
        if (result.changed) {
          const nextSibling = elm.nextSibling

          // beforeText
          const beforeNode = document.createTextNode(result.beforeText)
          elm.parentNode.insertBefore(beforeNode, nextSibling)

          // newHTML
          elm.parentNode.insertBefore(result.newHTML, nextSibling)

          // afterText
          const afterNode = document.createTextNode(result.afterText)
          elm.parentNode.insertBefore(afterNode, nextSibling)

          elm.remove()
          self._searchElement(tp, afterNode)
        }
      }
    } else {
      for(var ci = 0; ci < elm.childNodes.length; ci++){
        const childElm = elm.childNodes[ci]
        self._searchElement(tp, childElm)
      }
    }
    return ''
  }
}

module.exports = cardApi => new AutoTag(cardApi)
