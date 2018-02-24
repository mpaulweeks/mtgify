(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict'

const DeckList = require('../lib/DeckList')

const CardAPI = new (class {
  constructor() {
    const self = this
    self.lookupMultiverse = new Promise((resolve, reject) => {
      self.resolveMultiverse = lookup => resolve(lookup)
    })
    self.lookupAllCards = new Promise((resolve, reject) => {
      self.resolveAllCards = lookup => resolve(lookup)
    })
  }
  init(baseUrl) {
    const self = this
    self.baseUrl = baseUrl
    fetch(`${baseUrl}/json/Multiverse.lower.json`)
      .then(res => res.json())
      .then(lookup => self.resolveMultiverse(lookup))
    fetch(`${baseUrl}/json/AllCards.lower.json`)
      .then(res => res.json())
      .then(lookup => self.resolveAllCards(lookup))
  }
  normalizeCardName(cardName) {
    return cardName.trim().toLowerCase()
  }
  performLookup(lookup, cardName) {
    return lookup[this.normalizeCardName(cardName)]
  }
  getMultiverseId(cardName) {
    const self = this
    return self.lookupMultiverse
      .then(lookup => self.performLookup(lookup, cardName))
  }
  getCard(cardName) {
    const self = this
    return self.lookupAllCards
      .then(lookup => self.performLookup(lookup, cardName))
  }
})()



class _TextListener extends HTMLElement {
  setupTextListener(callback) {
    const self = this
    const callbackWrapper = function() {
      self._observer.disconnect();
      callback()
    }
    self._observer = new MutationObserver(callbackWrapper)
    self._observer.observe(self, { childList: true })
  }
}
class _AutoCard extends _TextListener {
  connectedCallback() {
    this.name = this.getAttribute('name')
    this.innerHTML = ''

    const url = `http://magiccards.info/query?q=${this.name}`
    const anchor = document.createElement('a')
    anchor.setAttribute('href', url)
    anchor.setAttribute('target', '_blank')
    anchor.innerHTML = this.name
    this.appendChild(anchor)
    this.anchor = anchor

    this.onLoad()
  }
  onLoad() {
    // do nothing, children override
  }
}
class CardText extends _AutoCard {}
class CardImage extends _AutoCard {
  onLoad() {
    const self = this
    CardAPI.getMultiverseId(self.name)
      .then(mid => self.loadMultiverseId(mid))
  }
  loadMultiverseId(mid) {
    this.mid = mid
    if (this.mid){
      const url = `http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${mid}&type=card`
      const image = document.createElement('img')
      image.setAttribute('src', url)
      image.setAttribute('alt', this.name)
      image.setAttribute('title', this.name)
      this.anchor.innerHTML = ''
      this.anchor.appendChild(image)
      this.image = image
    }
  }
}

class CardList extends _TextListener {
  connectedCallback() {
    const listSrc = this.getAttribute('src')
    this.renderText(listSrc)
  }
  renderText(listSrc) {
    const self = this;
    self.innerHTML = 'loading deck list...'
    DeckList.DeckListFromUrl(listSrc, cardName => CardAPI.getCard(cardName))
      .then(data => {
        self.innerHTML = ''
        data.forEach(typeData => {
          self.innerHTML += `<h3>${typeData.type}</h3>`
          typeData.cards.forEach(card => {
            self.innerHTML += `<div>${card.quantity}x ${card.card.name}</div>`
          })
        })
      })
  }
}

customElements.define('card-text', CardText)
customElements.define('card-image', CardImage)
customElements.define('card-list', CardList)

class Exp extends _TextListener {
  print() {
    this.innerHTML += '1'
    console.log('innerHTML', this.innerHTML)
    console.log('innerText', this.innerText)
    console.log('textContent', this.textContent)
  }
  connectedCallback() {
    // this.print()
    // setTimeout(() => this.print(), 1000)
    this.setupTextListener(() => this.print())
  }
}
customElements.define('card-exp', Exp)

module.exports = {
  CardAPI,
}

},{"../lib/DeckList":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){

const AutoCard = require('./AutoCard.js')

// todo better solution
window.CardAPI = AutoCard.CardAPI

},{"./AutoCard.js":1}]},{},[3]);
