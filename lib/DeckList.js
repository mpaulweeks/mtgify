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
  constructor(text, options, allCardsLookup){
    this.text = text
    this.options = options
    this.allCardsLookup = allCardsLookup
  }
  categorizeCardList() {
    const { text, allCardsLookup } = this;
    const promises = []
    text.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed.length === 0){
        return
      }
      // todo use regex
      const split = trimmed.indexOf('x ')
      const quantity = trimmed.substring(0, split)
      const cardName = trimmed.substring(split + 2)
      const promise = allCardsLookup(cardName)
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
    const cardTypes = {}
    cardData.forEach(cd => {
      if (cd === null){
        return
      }
      if (!cardTypes[cd.type]) {
        cardTypes[cd.type] = []
      }
      cardTypes[cd.type].push(cd)
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
          data.push({
            type: type,
            cards: cardTypes[type],
          })
        })
        return data
      })
  }
}

function DeckListFromUrl(url, options, allCardsLookup) {
  return fetch(url)
    .then(res => res.text())
    .then(text => new DeckList(text, options, allCardsLookup).getDataPromise())
}

module.exports = {
  DeckList,
  DeckListFromUrl,
}
