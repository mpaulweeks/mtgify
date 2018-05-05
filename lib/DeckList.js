'use strict'

const lineRegex = /^[0-9]+x \w+$/
const typeCommander = 'Commander'
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
  'Commander',
  'Creature',
  'Planeswalker',
  'Artifact',
  'Enchantment',
  'Instant',
  'Sorcery',
  'Land',
]

const regexCategory = /\(\d+\)/
const regexCommentName = /^name (.+)/
const regexCommentInfo = /^info (.+)/
const regexCommentLink = /^link ([^ ]+) (.+)/
const regexCardNameCommander = /(.+) \*CMDR\*$/

class DeckList {
  constructor(text, options, cardApi){
    this.text = text
    this.options = options
    this.cardApi = cardApi
  }
  categorizeCardList() {
    const { text, options, cardApi } = this;
    const promises = []
    const meta = {}
    text.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed.length === 0){
        return
      }
      if (trimmed[0] === '#') {
        const comment = trimmed.substring(1).trim()
        const nameMatch = regexCommentName.exec(comment)
        if (nameMatch){
          meta.name = nameMatch[1]
        }
        const linkMatch = regexCommentLink.exec(comment)
        if (linkMatch){
          meta.link = {
            url: linkMatch[1],
            label: linkMatch[2],
          }
        }
        const infoMatch = regexCommentInfo.exec(comment)
        if (infoMatch){
          meta.info = infoMatch[1]
        }
        return
      }
      if (regexCategory.test(trimmed)){
        console.log('skipping', line)
        return
      }
      // todo use regex
      const split = trimmed.indexOf('x ')
      const quantity = parseInt(trimmed.substring(0, split), 10)
      let cardName = trimmed.substring(split + 2)
      const commanderMatch = regexCardNameCommander.exec(cardName)
      if (commanderMatch){
        cardName = commanderMatch[1]
      }
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
          if (commanderMatch){
            cardType = typeCommander
          }
          return {
            quantity: quantity,
            type: cardType,
            card: card,
          }
        })
      promises.push(promise)
    })
    return Promise.all(promises).then(values => this.processData(meta, values))
  }
  processData(meta, cardData) {
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
    return {
      meta: meta,
      cardTypes: cardTypes,
    }
  }
  getDataPromise(){
    return this.categorizeCardList()
      .then(deckData => {
        const { meta, cardTypes } = deckData
        const cardData = []
        typeDisplay.forEach(type => {
          if (!cardTypes[type]){
            return
          }
          cardData.push(cardTypes[type])
        })
        return {
          meta: meta,
          cardData: cardData,
        }
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
