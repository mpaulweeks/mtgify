
const config = require('./Config')()
const cardApi = require('./CardAPI')()

require('./AutoCard')(cardApi)
if (config.enableAutoTag){
  require('./AutoTag')(cardApi)
}
