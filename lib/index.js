
const config = require('./Config')()
const cardApi = require('./CardAPI')()

require('./AutoCard')(cardApi)
const autoTag = require('./AutoTag')(cardApi)
window.AUTOCARD_TAG = autoTag

document.addEventListener("DOMContentLoaded", function() {
  if (config.enableAutoTag){
    autoTag.tagBody()
  }
})
