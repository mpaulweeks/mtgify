'use strict'

const TextParser = require('./TextParser')

describe('TextParser', () => {
  test('replaceFirst()', () => {
    const verifier = text => {
      if (text[0] === 'a' && !text.includes(' ')){
        return text.toUpperCase()
      }
      return null
    }
    const sut = new TextParser(verifier, 6)

    const input = "abcde bob abc"
    const expected = "ABCDE bob abc"
    const result = sut.replaceFirst(input)
    expect(result.changed).toEqual(true)
    expect(result.newHTML).toEqual("ABCDE")
    expect(result.beforeText).toEqual("")
    expect(result.afterText).toEqual(" bob abc")
  })
})
