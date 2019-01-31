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
const DeckType = {
  Default: 'deckList',
  Cuts: 'cuts',
  Adds: 'adds',
}
const typeCommander = 'Commander'
const typeNotFound = 'Uncategorized'
const typeDisplay = [
  typeCommander,
  'Creature',
  'Planeswalker',
  'Artifact',
  'Enchantment',
  'Instant',
  'Sorcery',
  'Land',
  typeNotFound,
]

const regexCategory = /\(\d+\)/
const regexCommentDeck = /^deck$/
const regexCommentCuts = /^cuts$/
const regexCommentAdds = /^adds$/
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
  parseData() {
    const { text, options, cardApi } = this;
    const meta = {}
    const promises = []
    let deckType = DeckType.Default
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

        if (regexCommentDeck.test(comment)){
          deckType = DeckType.Default
        }
        if (regexCommentCuts.test(comment)){
          deckType = DeckType.Cuts
        }
        if (regexCommentAdds.test(comment)){
          deckType = DeckType.Adds
        }
        return
      }
      if (regexCategory.test(trimmed)){
        // console.log('skipping', line)
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
      const cardMeta = {
        deck: deckType,
      }
      const promise = cardApi.getCardInfo(cardName)
        .then(card => {
          let cardType = typeNotFound
          if (!card){
            // console.log('failed to find card', line)
            card = {
              name: cardName,
            }
          } else {
            typePriority.forEach(type => {
              if (card.types.includes(type)) {
                cardType = type
              }
            })
          }
          if (commanderMatch){
            cardType = typeCommander
          }
          return {
            ...cardMeta,
            quantity: quantity,
            type: cardType,
            card: card,
          }
        })
      promises.push(promise)
    })
    return Promise.all(promises).then(cards => ({ meta, cards }))
  }
  splitDecks(cards) {
    const types = {}
    cards.forEach(cd => {
      if (!types[cd.deck]){
        types[cd.deck] = []
      }
      types[cd.deck].push(cd)
    })
    return types
  }
  processData(data) {
    let { meta, cards } = data
    const { options } = this
    if (options.reverse) {
      cards = cards.reverse()
    }
    const rawDecks = this.splitDecks(cards)
    const decks = {}
    for (let deckType in rawDecks){
      decks[deckType] = this.categorizeDeck(rawDecks[deckType])
    }
    return {
      meta: meta,
      ...decks,
    }
  }
  getDataPromise(){
    return this.parseData()
      .then(data => this.processData(data))
  }
  categorizeDeck(cards){
    const cardTypes = {}
    cards.forEach(cd => {
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
    const deckList = []
    typeDisplay.forEach(type => {
      if (!cardTypes[type]){
        return
      }
      deckList.push(cardTypes[type])
    })
    return deckList
  }
}

function DeckListFromUrl(url, options, cardApi) {
  return fetch(url)
    .then(res => res.text())
    .then(text => new DeckList(text, options, cardApi).getDataPromise())
}
function DeckListFromText(text, options, cardApi) {
  return new DeckList(text, options, cardApi).getDataPromise()
}

module.exports = {
  DeckList,
  DeckListFromUrl,
  DeckListFromText,
}
