
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

class CardList extends HTMLElement {
  connectedCallback() {
    const self = this
    // todo need true solution
    setTimeout(() => self.todoOnLoad(), 100)
  }
  todoOnLoad() {
    const self = this
    const listSrc = this.getAttribute('src')
    this.renderText(listSrc)
  }
  renderText(listSrc) {
    const self = this;
    DeckListFromUrl(listSrc, cardName => CardAPI.getCard(cardName))
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
