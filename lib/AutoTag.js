'use strict'

class AutoTag {
  constructor(cardApi){
    this.cardApi = cardApi
  }
  tagBody(customConfig) {
    return this.tagElement(document.body, customConfig)
  }
  tagElement(elm, customConfig) {
    console.log('searching element for card names:', elm)

    customConfig = customConfig || {}
    const config = {
      ignoreCase: false,
      excludeUnsets: true,
      ...customConfig,
    }
    config.trimWhitespace = false // enforced, else it messed up text replace spacing

    const popup = document.createElement('div')
    popup.style = 'position: fixed; top: 5px; right: 5px; padding: 10px; background-color: #FFFFFF; color: #000000; border: 2px solid #000000; border-radius: 10px;'
    popup.innerHTML = 'searching for Magic cards...'
    if (config.popupAutoTag){
      document.body.appendChild(popup)
    }

    const self = this
    return self.cardApi.newTextParser(config)
      .then(tp => {
        self._searchElement(tp, elm)
        return 'todo'
      })
      .then(result => {
        console.log('done searching')
        popup.remove()
        return result
      })
      .catch(err => {
        console.log('error searching:', err)
        popup.remove()
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
