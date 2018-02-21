'use strict'

const MtgJson = require('../lib/MtgJson')

MtgJson.generateMultiverseJson().then(msg => console.log('all done!', msg))
