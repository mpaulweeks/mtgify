
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
    fetch(`${baseUrl}/json/AllCards.json`)
      .then(res => res.json())
      .then(lookup => {
        // todo this should be a ready file, like Multiverse
        const lowered = {}
        for (var key in lookup){
          const card = lookup[key]
          const loweredKey = self.normalizeCardName(card.name)
          lowered[loweredKey] = card
        }
        self.resolveAllCards(lowered)
      })
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

class _AutoCard extends HTMLElement {
  connectedCallback() {
    const self = this
    // todo need true solution
    setTimeout(() => self.todoOnLoad(), 100)
  }
  todoOnLoad() {
    this.name = this.innerHTML
    this.innerHTML = ''

    const url = `http://magiccards.info/query?q=${this.name}`
    const anchor = document.createElement('a')
    anchor.setAttribute('href', url)
    anchor.setAttribute('target', '_blank')
    anchor.innerHTML = this.name
    this.appendChild(anchor)
    this.anchor = anchor
  }
}
class CardText extends _AutoCard {}
class CardImage extends _AutoCard {
  todoOnLoad() {
    super.todoOnLoad()
    const self = this
    CardAPI.getMultiverseId(self.name)
      .then(mid => self.loadMultiverseId(mid))
  }
  loadMultiverseId(mid) {
    this.mid = mid
    if (this.mid){
      // todo get proper url
      const url = `${mid}`
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

class CardList extends HTMLElement {
  connectedCallback() {
    const self = this
    // todo need true solution
    setTimeout(() => self.todoOnLoad(), 100)
  }
  todoOnLoad() {
    const self = this
    const listSrc = this.getAttribute('src')
    fetch(listSrc)
      .then(res => res.text())
      .then(text => self.renderText(text))
  }
  categorizeCardList(text, lookup) {
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
      const promise = lookup(cardName)
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
  renderText(text) {
    const self = this;
    self.categorizeCardList(text, cardName => CardAPI.getCard(cardName))
      .then(cardTypes => {
        self.innerHTML = ''
        typeDisplay.forEach(type => {
          if (!cardTypes[type]){
            return
          }
          self.innerHTML += `<h3>${type}</h3>`
          cardTypes[type].forEach(card => {
            self.innerHTML += `<div>${card.quantity}x ${card.card.name}</div>`
          })
        })
      })
  }
}

customElements.define('card-text', CardText)
customElements.define('card-image', CardImage)
customElements.define('card-list', CardList)
