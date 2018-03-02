'use strict'

function compress_idea(obj) {
  if (obj === null) {
    return obj
  } else if (obj.constructor === Array) {
    return obj.map(compress)
  } else if (typeof obj === 'object') {
    // compress object
  } else {
    return obj
  }
}

function compressArray(arr) {
  const keys = {}
  arr.forEach(item => {
    for (let k in item) {
      keys[k] = true
    }
  })
  const keyNames = []
  for (let k in keys){
    keyNames.push(k)
  }
  keyNames.sort()
  const keyIndex = {}
  keyNames.forEach((kn, i) => {
    keyIndex[kn] = i
  })

  const out = []
  arr.forEach(item => {
    const itemArr = []
    for (let k in item) {
      itemArr[keyIndex[k]] = item[k]
    }
    out.push(itemArr)
  })
  return {
    key: keyNames,
    arr: out,
  }
}

function decompress(obj) {
  // todo benchmark this with CardInfo
}

module.exports = {
  compressArray,
}
