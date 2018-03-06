'use strict'

const TextParser = require('./TextParser')

describe('TextParser', () => {
  test('searchText()', () => {
    const verifier = text => {
      if (text[0] === 'a' && text.length < 6){
        return text.toUpperCase()
      }
      return null
    }
    const sut = new TextParser(verifier)

    const input = "abcde bob abc"
    const expected = "ABCDE bob ABC"
    const result = sut.searchText(input)
    expect(result.changed).toEqual(true)
    expect(result.newText).toEqual(expected)
  })
})
