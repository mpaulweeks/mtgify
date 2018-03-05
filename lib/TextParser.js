'use strict'

class TextParser {
  constructor(verifier, replaceCallback, maxLength){
    this.verifier = verifier
    this.replaceCallback = replaceCallback
    this.maxLength = maxLength || 141
  }

  tryReplaceText(text){
    const result = this.verifier(text)
    if (result !== null) {
      return {
        ok: true,
        newText: this.replaceCallback(result),
      }
    }
    return {
      ok: false,
    }
  }

  searchText(text){
    let newText = ''
    for (let i = 0; i < text.length; i++){
      const maxLength = Math.min(this.maxLength, text.length - i)
      let w = i + maxLength + 1
      let textWindow = ''
      let result = { ok: false }
      while(!result.ok && w > i){
        w -= 1
        textWindow = text.substring(i, w)
        result = this.tryReplaceText(textWindow)
      }
      if (result.ok) {
        i = w - 1 //offset incoming ++
        newText += result.newText
      } else {
        newText += text[i]
      }
    }
    return newText
  }
}

module.exports = TextParser
