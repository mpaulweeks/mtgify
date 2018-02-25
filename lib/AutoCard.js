'use strict'

const DeckList = require('./DeckList')
const HoverCard = require('./HoverCard')

const CardAPI = new (class {
  constructor() {
    const self = this
    self.lookupMultiverse = new Promise((resolve, reject) => {
      self.resolveMultiverse = lookup => resolve(lookup)
    })
    self.lookupAllCards = new Promise((resolve, reject) => {
      self.resolveAllCards = lookup => resolve(lookup)
    })
    self.baseUrl = (
      window.location.pathname.includes('test') ?
      `${window.location.href}/../../` :
      'http://autocard.mpaulweeks.com'
    )
    fetch(`${self.baseUrl}/json/Multiverse.lower.json`)
      .then(res => res.json())
      .then(lookup => self.resolveMultiverse(lookup))
    fetch(`${self.baseUrl}/json/AllCards.lower.json`)
      .then(res => res.json())
      .then(lookup => self.resolveAllCards(lookup))
  }
  normalizeCardName(cardName) {
    return cardName.trim().toLowerCase()
  }
  performLookup(lookup, cardName) {
    return lookup[this.normalizeCardName(cardName)]
  }
  getMultiverse(cardName) {
    const self = this
    return self.lookupMultiverse
      .then(lookup => self.performLookup(lookup, cardName))
      .then(mid => {
        return {
          mid: mid,
          name: cardName,
          imgUrl: `http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${mid}&type=card`,
        }
      })
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
  getMultiverse() {
    return CardAPI.getMultiverse(this.name)
  }
  onLoad() {
    // do nothing, children override
  }
}
class CardText extends _AutoCard {
  onLoad() {
    this.onmouseover = evt => {
      HoverCard.show(this)
    }
    this.onmouseout = evt => {
      HoverCard.hide(this)
    }
  }
}
class CardImage extends _AutoCard {
  onLoad() {
    const self = this
    this.loadMultiverseId()
  }
  loadMultiverseId(mid) {
    const self = this
    self.getMultiverse()
      .then(multi => {
        const image = document.createElement('img')
        image.setAttribute('src', multi.imgUrl)
        image.setAttribute('alt', self.name)
        image.setAttribute('title', self.name)
        self.anchor.innerHTML = ''
        self.anchor.appendChild(image)
        self.image = image
      })
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
            self.innerHTML += `<div>${card.quantity}x <card-text name="${card.card.name}"></card-text></div>`
          })
        })
      })
  }
}

customElements.define('card-text', CardText)
customElements.define('card-image', CardImage)
customElements.define('card-list', CardList)

module.exports = {}
