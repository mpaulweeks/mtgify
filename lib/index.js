
const config = require('./Config')()
const cardApi = require('./CardAPI')()

require('./AutoCard')(cardApi)
if (config.useParser){
  require('./Parser')(cardApi)
}
