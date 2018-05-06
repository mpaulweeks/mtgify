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
      .then(deckData => {
        const { deckList } = deckData
        expect(deckList.length).toEqual(5)
        expect(deckList[0].type === 'Creature')
        expect(deckList[1].cards.length === 3)
        expect(deckList[4].type === 'Uncategorized')
        expect(deckList[1].cards[0].name === 'Test Card')
      })
  })
  test('options.reverse = false', () => {
    const sut1 = new DeckList.DeckList(T.text, {}, T.cardApi)
    return sut1.getDataPromise()
      .then(deckData => {
        const { deckList } = deckData
        expect(deckList[0].cards[0].card.name).toEqual('Foundry Street Denizen')
      })
  })
  test('options.reverse = true', () => {
    const sut2 = new DeckList.DeckList(T.text, {reverse: true}, T.cardApi)
    return sut2.getDataPromise()
      .then(deckData => {
        const { deckList } = deckData
        expect(deckList[0].cards[0].card.name).toEqual('Wojek Halberdiers')
      })
  })
})
