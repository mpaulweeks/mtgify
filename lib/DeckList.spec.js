'use strict'

const fs = require('fs')
const DeckList = require('./DeckList')

const fetchAllCards = () => {
  const content = fs.readFileSync('./test/AllCards.lower.test.json', "utf8")
  const lookupData = JSON.parse(content)
  return cardName => {
    const p = new Promise((resolve, reject) => {
      const lookup = lookupData[cardName.toLowerCase()]
      resolve(lookup)
    })
    return p
  }
}

describe('DeckList module', () => {
  const T = {}
  beforeAll(() => {
    T.allCardsLookup = fetchAllCards()
    T.text = fs.readFileSync('./test/sample_deck.txt', "utf8")
  })
  test('returns all cards', () => {
    const sut = new DeckList.DeckList(T.text, {}, T.allCardsLookup)
    return sut.getDataPromise()
      .then(cardTypes => {
        expect(cardTypes.length).toEqual(4)
        expect(cardTypes[0].type === 'Creature')
        expect(cardTypes[1].cards.length === 3)
      })
  })
  test('options.reverse = false', () => {
    const sut1 = new DeckList.DeckList(T.text, {}, T.allCardsLookup)
    return sut1.getDataPromise()
      .then(cardTypes => {
        expect(cardTypes[0].cards[0].card.name).toEqual('Foundry Street Denizen')
      })
  })
  test('options.reverse = true', () => {
    const sut2 = new DeckList.DeckList(T.text, {reverse: true}, T.allCardsLookup)
    return sut2.getDataPromise()
      .then(cardTypes => {
        expect(cardTypes[0].cards[0].card.name).toEqual('Wojek Halberdiers')
      })
  })
})
