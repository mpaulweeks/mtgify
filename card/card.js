
const CardAPI = new (class {
  constructor() {
    this.multiverse = new Promise((resolve, reject) => {
      // todo real promise from fetch
      resolve({'fog': '12345'})
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
class CardMedium extends _AutoCard {}

customElements.define('card-text', CardText);
customElements.define('card-medium', CardMedium);
