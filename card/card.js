
const CardAPI = new (class {
  constructor() {
    const self = this
    self.multiverse = new Promise((resolve, reject) => {
      self.multiverseResolve = lookup => resolve(lookup)
    })
  }
  init(baseUrl) {
    const self = this
    self.baseUrl = baseUrl
    fetch(`${baseUrl}/json/Multiverse.lower.json`)
      .then(res => res.json())
      .then(lookup => self.multiverseResolve(lookup))
  }
  normalizeCardName(cardName) {
    return cardName.trim().toLowerCase()
  }
  performLookup(lookup, cardName) {
    return lookup[this.normalizeCardName(cardName)]
  }
  getMultiverseId(cardName) {
    const self = this
    return self.multiverse
      .then(lookup => self.performLookup(lookup, cardName))
  }
})()

class _AutoCard extends HTMLElement {
  connectedCallback() {
    const self = this
    // todo need true solution
    setTimeout(() => self.todoOnLoad(), 100);
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

customElements.define('card-text', CardText);
customElements.define('card-image', CardImage);
