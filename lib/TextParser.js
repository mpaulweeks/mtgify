'use strict'

class TextParser {
  constructor(verifier, maxLength){
    this.verifier = verifier
    this.maxLength = maxLength || 141
  }

  tryReplaceText(text){
    const result = this.verifier(text)
    if (result !== null) {
      return {
        ok: true,
        newText: result,
      }
    }
    return {
      ok: false,
    }
  }

  searchText(text){
    let newText = ''
    let changed = false
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
        changed = true
      } else {
        newText += text[i]
      }
    }
    // todo end early, return before/after found
    return {
      changed,
      newText,
    }
  }
}

module.exports = TextParser
