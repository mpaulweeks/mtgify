'use strict'

const TestHelper = require('./TestHelper')
const CardAPI = require('./CardAPI')

describe('CardAPI module', () => {
  const T = {}
  beforeAll(() => {
    T.sut = TestHelper.CardApi
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
        expect(lower.imgUrl).toEqual("https://magiccards.info/scans/en/xln/149.jpg")
        expect(lower.cmc).toEqual(2)
        expect(lower.types).toEqual(["Instant"])
      })
    })
  })
})
