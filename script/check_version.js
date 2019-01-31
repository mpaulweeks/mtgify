'use strict'

const MtgJson = require('../lib/MtgJson')

MtgJson.checkVersion().then(needsUpdate => console.log(needsUpdate));
