'use strict'

const TextParser = require('./TextParser')

describe('TextParser', () => {
  const T = {}
  beforeAll(() => {
  })
  test('searchText()', () => {
    T.verifier = text => text[0] === 'a' && text.length < 6 ? text : null
    T.replaceCallback = text => text.toUpperCase()
    T.sut = new TextParser(T.verifier, T.replaceCallback)

    const input = "abcde bob abc"
    const expected = "ABCDE bob ABC"
    const result = T.sut.searchText(input)
    expect(result).toEqual(expected)
  })
})
