'use strict'

const fetch = require('node-fetch')

class Version {
  constructor(version){
    this.version = version
  }
  major(){
    return parseInt(this.version.split('.')[0], 10);
  }
  minor(){
    return parseInt(this.version.split('.')[1], 10);
  }
  patch(){
    return parseInt(this.version.split('.')[2], 10);
  }
  isUpdate(otherVersion){
    return (
      this.major() > otherVersion.major() ||
      this.major() === otherVersion.major() && this.minor() > otherVersion.minor() ||
      this.major() === otherVersion.major() && this.minor() === otherVersion.minor() && this.patch() > otherVersion.patch()
    );
  }
  toJSON() {
    return JSON.stringify({
      version: this.version,
    })
  }
}

function versionFromJSON(jsonObj){
  return new Version(jsonObj.version)
}

function fetchVersion() {
  return fetch('https://mtgjson.com/json/version-full.json')
    .then(res => res.json())
    .then(data => versionFromJSON(data))
}

module.exports = {
  Version,
  versionFromJSON,
  fetchVersion,
}
