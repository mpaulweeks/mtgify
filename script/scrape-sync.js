'use strict'

const MtgJson = require('../lib/MtgJson')

MtgJson.tryScrapeSync().then(msg => console.log(msg))
