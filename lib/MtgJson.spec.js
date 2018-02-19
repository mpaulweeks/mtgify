'use strict'

const MtgJson = require('./MtgJson')
const expect = require('chai').expect

const versionRegex = /^[0-9]+\.[0-9]+\.[0-9]+$/
const rssTimeRegex = /^[0-9]+-[0-9]+-[0-9]+T00:00:00$/

describe('MtgJson module', () => {
  describe('"fetchVersion"', () => {
    before(() => {
      this.sut = MtgJson.fetchVersion()
    })

    it('should return a Version object', () => {
      return this.sut.then(function (version){
        expect(version.version).to.match(versionRegex)
        expect(version.updated).to.match(rssTimeRegex)
      })
    })
    it('should return a new Version', () => {
      const oldVersion = new MtgJson.Version('1.0.0', '2018-01-01T00:00:00')
      return this.sut.then(function (version){
        expect(version.isUpdate(oldVersion)).to.equal(true)
      })
    })
  })

  describe('"versionFromJSON"', () => {
    it('should parse JSON into version', () => {
      const expected = {
        version: '1.0.0',
        updated: '2018-01-01T00:00:00',
      }
      const result = MtgJson.versionFromJSON(JSON.stringify(expected))
      expect(expected.version).to.equal(result.version)
      expect(expected.updated).to.equal(result.updated)
    })
  })
})
