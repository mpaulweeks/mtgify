'use strict'

const TestHelper = require('./TestHelper')
const ParserFactory = require('./Parser')

describe('Parser class', () => {
  const T = {}
  beforeAll(() => {
    const cardApi = TestHelper.CardApi
    T.sut = ParserFactory(cardApi)
  })
  test('replaceTextWithCards()', () => {
    const result = T.sut.replaceTextWithCards('')
    return result.then(newText => {
      expect(newText).toEqual('')
    })
  })
})
