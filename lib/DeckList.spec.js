'use strict'

const fs = require('fs')
const DeckList = require('./DeckList')
const TestHelper = require('./TestHelper')

describe('DeckList module', () => {
  const T = {}
  beforeAll(() => {
    T.cardApi = TestHelper.CardApi
    T.text = fs.readFileSync('./test/sample_deck.txt', "utf8")
  })
  test('returns all cards', () => {
    const sut = new DeckList.DeckList(T.text, {}, T.cardApi)
    return sut.getDataPromise()
      .then(cardTypes => {
        expect(cardTypes.length).toEqual(4)
        expect(cardTypes[0].type === 'Creature')
        expect(cardTypes[1].cards.length === 3)
      })
  })
  test('options.reverse = false', () => {
    const sut1 = new DeckList.DeckList(T.text, {}, T.cardApi)
    return sut1.getDataPromise()
      .then(cardTypes => {
        expect(cardTypes[0].cards[0].card.name).toEqual('Foundry Street Denizen')
      })
  })
  test('options.reverse = true', () => {
    const sut2 = new DeckList.DeckList(T.text, {reverse: true}, T.cardApi)
    return sut2.getDataPromise()
      .then(cardTypes => {
        expect(cardTypes[0].cards[0].card.name).toEqual('Wojek Halberdiers')
      })
  })
})
