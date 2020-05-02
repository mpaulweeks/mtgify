'use strict'

const Config = require('./Config')
const TestHelper = require('./TestHelper')
const CardAPI = require('./CardAPI')

describe('CardAPI', () => {
  const T = {}
  beforeAll(() => {
    T.sut = TestHelper.CardApi
    T.config = Config()
  })
  test('CardAPI.getCardInfo() ignoreCase=true', () => {
    const config = Config({ ignoreCase: true })
    const lowerPromise = T.sut.getCardInfo('dark confidant', config)
    const upperPromise = T.sut.getCardInfo('DARK CONFIDANT', config)
    return lowerPromise.then(lower =>
      upperPromise.then(upper => {
        expect(lower.name).toEqual('Dark Confidant')
        expect(lower).toEqual(upper)
      })
    )
  })
  test('CardAPI.getCardInfo() ignoreCase=false', () => {
    const config = Config({ ignoreCase: false })
    const lowerPromise = T.sut.getCardInfo('dark confidant', config)
    const normalPromise = T.sut.getCardInfo('Dark Confidant', config)
    return lowerPromise.then(lower =>
      normalPromise.then(normal => {
        expect(lower).toEqual(null)
        expect(normal.name).toEqual('Dark Confidant')
      })
    )
  })
  test('getCardInfo() has info', () => {
    const promise = T.sut.getCardInfo('lightning strike', T.config)
    return promise.then(card => {
      expect(card.name).toEqual('Lightning Strike')
      expect(card.mid).toEqual(435303)
      expect(card.cmc).toEqual(2)
      expect(card.types).toEqual(["Instant"])
      expect(card.imgUrl).toEqual("https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=435303&type=card")
    })
  })
  test('getCardInfo() reads Config().imgSource', () => {
    const config = Config({ imgSource: 'scryfall' })
    const promise = T.sut.getCardInfo('lightning strike', config)
    return promise.then(card => {
      expect(card.imgUrl).toEqual("https://api.scryfall.com/cards/xln/149/en?format=image")
    })
  })
  test('newTextParser() has maxLength set correctly', () => {
    return T.sut.newTextParser({ excludeUnsets: true }).then(tp => {
      expect(tp.maxLength).toEqual(33)
      T.sut.newTextParser({ excludeUnsets: false }).then(tp => {
        expect(tp.maxLength).toEqual(141)
      })
    })
  })
})
