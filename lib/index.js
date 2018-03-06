
const config = require('./Config')()
const cardApi = require('./CardAPI')()

require('./AutoCard')(cardApi)
const autoTag = require('./AutoTag')(cardApi)
window.AUTOCARD_TAG = autoTag

setTimeout(() => {
  // on document ready
  if (config.enableAutoTag){
    autoTag.tagBody()
  }
})
