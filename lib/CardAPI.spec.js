'use strict'

const TestHelper = require('./TestHelper')
const CardAPI = require('./CardAPI')

describe('CardAPI', () => {
  const T = {}
  beforeAll(() => {
    T.sut = TestHelper.CardApi
  })
  test('CardAPI.getCardInfo() ignores case', () => {
    const lowerPromise = T.sut.getCardInfo('dark confidant')
    const upperPromise = T.sut.getCardInfo('DARK CONFIDANT')
    return lowerPromise.then(lower => {
      upperPromise.then(upper => {
        expect(lower.name).toEqual('Dark Confidant')
        expect(lower).toEqual(upper)
      })
    })
  })
  test('getCardInfo() has info', () => {
    const promise = T.sut.getCardInfo('lightning strike')
    return promise.then(card => {
      expect(card.name).toEqual('Lightning Strike')
      expect(card.mid).toEqual(435303)
      expect(card.cmc).toEqual(2)
      expect(card.types).toEqual(["Instant"])
      expect(card.imgUrl).toEqual("http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=435303&type=card")
    })
  })
  test('getCardInfo() reads Config().useMci', () => {
    window.AUTOCARD_MCI_IMAGES = true
    const promise = T.sut.getCardInfo('lightning strike')
    return promise.then(card => {
      expect(card.imgUrl).toEqual("https://magiccards.info/scans/en/xln/149.jpg")
    })
  })
})
