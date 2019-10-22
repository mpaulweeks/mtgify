'use strict'

const MtgJson = require('./MtgJson')

describe('MtgJson module', () => {
  describe('"Version"', () => {
    test('"versionFromJSON" should parse JSON into version', () => {
      const testStart = new Date()
      // 2019/07/14 https://mtgjson.com/json/version.json
      const expected = {
        "date": "2019-07-07",
        "pricesDate": "2019-07-07",
        "version": "4.4.2-rebuild.1"
      }
      const result = MtgJson.test.versionFromJSON(expected)
      expect(expected.version).toEqual(result.version)
      expect(expected.date).toEqual(result.date)

      const updatedTime = new Date(result.updated)
      expect(testStart.getTime()).toBeLessThanOrEqual(updatedTime.getTime())
    })
  })
})
