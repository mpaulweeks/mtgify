'use strict'

const MtgJson = require('../lib/MtgJson')

MtgJson.scrapeJsonSync().then(msg => console.log(msg))
