'use strict'

const lineRegex = /^[0-9]+x \w+$/
const typePriority = [
  'Land',
  'Creature',
  'Artifact',
  'Enchantment',
  'Planeswalker',
  'Instant',
  'Sorcery',
].reverse()
const typeDisplay = [
  'Creature',
  'Planeswalker',
  'Artifact',
  'Enchantment',
  'Instant',
  'Sorcery',
  'Land',
]

class DeckList {
  constructor(text, options, cardApi){
    this.text = text
    this.options = options
    this.cardApi = cardApi
  }
  categorizeCardList() {
    const { text, cardApi } = this;
    const promises = []
    text.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed.length === 0){
        return
      }
      if (trimmed[0] === '#') {
        return
      }
      // todo use regex
      const split = trimmed.indexOf('x ')
      const quantity = parseInt(trimmed.substring(0, split), 10)
      const cardName = trimmed.substring(split + 2)
      const promise = cardApi.getCardInfo(cardName)
        .then(card => {
          if (!card){
            console.log('failed to find card', line)
            return null
          }
          let cardType = 'unknown'
          typePriority.forEach(type => {
            if (card.types.includes(type)) {
              cardType = type
            }
          })
          return {
            quantity: quantity,
            type: cardType,
            card: card,
          }
        })
      promises.push(promise)
    })
    return Promise.all(promises).then(values => this.processData(values))
  }
  processData(cardData) {
    const { options } = this
    if (options.reverse) {
      cardData = cardData.reverse()
    }

    const cardTypes = {}
    cardData.forEach(cd => {
      if (cd === null){
        return
      }
      if (!cardTypes[cd.type]) {
        cardTypes[cd.type] = {
          type: cd.type,
          cards: [],
          count: 0,
        }
      }
      cardTypes[cd.type].cards.push(cd)
      cardTypes[cd.type].count += cd.quantity
    })
    return cardTypes
  }
  getDataPromise(){
    return this.categorizeCardList()
      .then(cardTypes => {
        const data = []
        typeDisplay.forEach(type => {
          if (!cardTypes[type]){
            return
          }
          data.push(cardTypes[type])
        })
        return data
      })
  }
}

function DeckListFromUrl(url, options, cardApi) {
  return fetch(url)
    .then(res => res.text())
    .then(text => new DeckList(text, options, cardApi).getDataPromise())
}

module.exports = {
  DeckList,
  DeckListFromUrl,
}
