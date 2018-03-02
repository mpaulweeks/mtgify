'use strict'

const Compressor = require('./Compressor')

describe('Compressor module', () => {
  test('compressArray() sorts keys', () => {
    const input1 = [
      {a: 1, b: 2},
      {a: 3, b: 4},
    ]
    const input2 = [
      {b: 2, a: 1},
      {b: 4, a: 3},
    ]
    const expected = {
      key: ['a', 'b'],
      arr: [
        [1,2],
        [3,4],
      ],
    }
    expect(expected).toEqual(Compressor.compressArray(input1))
    expect(expected).toEqual(Compressor.compressArray(input2))
  })
})
