'use strict'

const MtgJson = require('./MtgJson')
const expect = require('chai').expect

const versionRegex = /^[0-9]+\.[0-9]+\.[0-9]+$/

describe('MtgJson module', () => {
  describe('"Version"', () => {
    it('should parse major/minor/patch', () => {
      const sut = new MtgJson.Version('12.345.6')
      expect(sut.major()).to.equal(12)
      expect(sut.minor()).to.equal(345)
      expect(sut.patch()).to.equal(6)
    })
    it('should compare Versions', () => {
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
        const v1 = new MtgJson.Version(tc[0]);
        const v2 = new MtgJson.Version(tc[1]);
        const expected = tc[2];
        expect(v1.isUpdate(v2)).to.equal(expected);
      })
    })
    it('"versionFromJSON" should parse JSON into version', () => {
      const expected = {
        version: '1.0.0',
      }
      const result = MtgJson.versionFromJSON(expected)
      expect(expected.version).to.equal(result.version)
    })
  })
})
