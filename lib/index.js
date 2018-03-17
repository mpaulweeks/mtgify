
require('./polyfills/custom-elements.min.js')

const constants = require('./Constants')
const config = require('./Config')()
const cardApi = require('./CardAPI')()

const autoCard = require('./AutoCard')(cardApi)
const autoTag = require('./AutoTag')(cardApi)

window.AUTOCARD_CONFIG = window.AUTOCARD_CONFIG || {}
window.AUTOCARD = {
  _cardApi: cardApi,
  constants: constants,
  config: window.AUTOCARD_CONFIG,
  getVersion: (config) => cardApi.getVersion(config),
  getRandomCard: (config) => cardApi.getRandomCard(config),
  tagBody: (config) => autoTag.tagBody(config),
  tagElement: (elm, config) => autoTag.tagElement(elm, config),
}

setTimeout(() => {
  // on document ready
  if (config.enableAutoTag){
    autoTag.tagBody()
  }
})
