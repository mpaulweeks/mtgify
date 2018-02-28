'use strict'

const fs = require('fs')

function mockFetchJson(result) {
  return () => new Promise((resolve, reject) => {
    resolve({
      json: () => result,
    })
  })
}

describe('CardAPI module', () => {
  const T = {}
  beforeAll(() => {
    const allCardsText = fs.readFileSync('./test/CardInfo.lower.test.json', "utf8")
    T.allCards = JSON.parse(allCardsText)
    window.fetch = mockFetchJson(T.allCards)
    T.sut = require('./CardAPI')
  })
  test('make a CardAPI', () => {
    const lowerPromise = T.sut.getCardInfo('lightning strike')
    const upperPromise = T.sut.getCardInfo('LIGHTNING STRIKE')
    // use await
    return lowerPromise.then(lower => {
      upperPromise.then(upper => {
        expect(lower).toEqual(upper)
        expect(lower.name).toEqual('Lightning Strike')
        expect(lower.mid).toEqual(435303)
        expect(lower.imgUrl).toEqual("http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=435303&type=card")
        expect(lower.cmc).toEqual(2)
        expect(lower.types).toEqual(["Instant"])
      })
    })
    // expect(lower).toEqual(upper)
  })
})
