'use strict'

const MtgJson = require('../lib/MtgJson')

MtgJson.generateAllCustomJson().then(msg => console.log('all done!', msg))
