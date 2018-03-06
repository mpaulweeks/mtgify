
const config = require('./Config')()
const cardApi = require('./CardAPI')()

const autoCard = require('./AutoCard')(cardApi)
const autoTag = require('./AutoTag')(cardApi)

window.AUTOCARD_CONFIG = window.AUTOCARD_CONFIG || {}
window.AUTOCARD = {
  config: window.AUTOCARD_CONFIG,
  tagBody: () => autoTag.tagBody(),
  tagElement: elm => autoTag.tagElement(elm),
}

setTimeout(() => {
  // on document ready
  if (config.enableAutoTag){
    autoTag.tagBody()
  }
})
