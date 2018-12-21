'use strict'

const MtgJson = require('./MtgJson')

const versionRegex = /^[0-9]+\.[0-9]+\.[0-9]+$/

describe('MtgJson module', () => {
  describe('"Version"', () => {
    test('should parse major/minor/patch', () => {
      const sut = new MtgJson.test.Version('12.345.6')
      expect(sut.major()).toEqual(12)
      expect(sut.minor()).toEqual(345)
      expect(sut.patch()).toEqual(6)
    })
    test('should compare Versions', () => {
      const testCases = [
        ['1.1.2', '1.1.1', true],
        ['1.2.0', '1.1.1', true],
        ['2.0.0', '1.1.1', true],
        ['3.3.3', '3.3.3', false],
        ['3.3.2', '3.3.3', false],
        ['3.2.9', '3.3.3', false],
        ['2.9.9', '3.3.3', false],
      ];
      testCases.forEach(tc => {
        const v1 = new MtgJson.test.Version(tc[0]);
        const v2 = new MtgJson.test.Version(tc[1]);
        const expected = tc[2];
        expect(v1.isUpdate(v2)).toEqual(expected);
      })
    })
    test('"versionFromJSON" should parse JSON into version', () => {
      // 2018/12/21 https://mtgjson.com/json/version.json
      const expected = {
        "date": "2018-12-18",
        "version": "4.2.0",
      };
      const result = MtgJson.test.versionFromJSON(expected)
      expect(expected.version).toEqual(result.version)
    })
  })
})
