'use strict'

const MtgJson = require('../lib/MtgJson')

MtgJson.tryScrape().then(msg => console.log(msg))
