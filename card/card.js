
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
    self.addEventListener('click', e => {
      self.openLink()
    });

    // todo need true solution
    setTimeout(() => {
      self.name = self.innerHTML
      CardAPI.getMultiverseId(self.name)
        .then(mid => self.loadMultiverseId(mid))
    }, 100);
  }

  getName() {
    return this.name
  }
  loadMultiverseId(mid) {
    this.mid = mid
    if (this.mid){
      this.innerHTML += '#' + mid
    }
  }

  openLink() {
    console.log(this)
  }
}
class CardText extends _AutoCard {}
class CardImage extends _AutoCard {}

customElements.define('card-text', CardText);
customElements.define('card-image', CardImage);
