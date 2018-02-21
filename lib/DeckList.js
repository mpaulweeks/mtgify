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
  constructor(text, allCardsLookup){
    this.text = text
    this.allCardsLookup = allCardsLookup
  }
  categorizeCardList() {
    const { text, allCardsLookup } = this;
    const cardTypes = {}
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
            return
          }
          let cardType = null
          typePriority.forEach(type => {
            if (card.types.includes(type)){
              cardType = type
            }
          })
          if (cardType){
            if (!cardTypes[cardType]){
              cardTypes[cardType] = []
            }
            cardTypes[cardType].push({
              quantity: quantity,
              card: card,
            })
          }
        })
      promises.push(promise)
    })
    return Promise.all(promises).then(() => cardTypes)
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

function DeckListFromUrl(url, allCardsLookup) {
  return fetch(url)
    .then(res => res.text())
    .then(text => new DeckList(text, allCardsLookup).getDataPromise())
}

module.exports = {
  DeckList,
  DeckListFromUrl,
}
