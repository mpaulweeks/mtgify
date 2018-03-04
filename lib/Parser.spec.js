'use strict'

const TestHelper = require('./TestHelper')
const Parser = require('./Parser')

describe('Parser class', () => {
  test('checkForCard()', () => {
    const cardApi = TestHelper.CardApi
    const sut = new Parser(cardApi)
    sut.checkForCard("Air Elemental")
      .then(exists => {
        expect(exists).toEqual(true)
      })
  })
})
