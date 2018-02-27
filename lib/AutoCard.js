'use strict'

const DeckList = require('./DeckList')
const HoverCard = require('./HoverCard')
const CardAPI = require('./CardAPI')

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
  getCardInfo() {
    return CardAPI.getCardInfo(this.name)
  }
  onLoad() {
    // do nothing, children override
  }
}
class CardText extends _AutoCard {
  onLoad() {
    this.onmouseover = evt => {
      HoverCard.show(this, evt)
    }
    this.onmouseout = evt => {
      HoverCard.hide(this, evt)
    }
    this.onmousemove = evt => {
      HoverCard.move(this, evt)
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
    self.getCardInfo()
      .then(info => {
        const image = document.createElement('img')
        image.setAttribute('src', info.imgUrl)
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
    this.listTitle = document.createElement('card-list-title')
    this.container = document.createElement('card-list-container')
    this.appendChild(this.listTitle)
    this.appendChild(this.container)
    this.renderText(listSrc)
  }
  renderText(listSrc) {
    const self = this;
    self.listTitle.innerHTML = this.getAttribute('name')
    self.container.innerHTML = 'loading deck list...'
    const options = {}
    DeckList.DeckListFromUrl(listSrc, options, cardName => CardAPI.getCardInfo(cardName))
      .then(data => {
        self.container.innerHTML = data.map(typeData => `
          <card-list-category>
            <card-list-category-title>${typeData.type}</card-list-category-title>
            ${typeData.cards.map(card => `
              <div>${card.quantity}x <card-text name="${card.card.name}"></card-text></div>
            `).join('')}
          </card-list-category>
        `).join('')
      })
  }
}

class CardListTitle extends HTMLElement {}
class CardListContainer extends HTMLElement {}
class CardListCategory extends HTMLElement {}
class CardListCategoryTitle extends HTMLElement {}

customElements.define('card-text', CardText)
customElements.define('card-image', CardImage)
customElements.define('card-list', CardList)
customElements.define('card-list-title', CardListTitle)
customElements.define('card-list-container', CardListContainer)
customElements.define('card-list-category', CardListCategory)
customElements.define('card-list-category-title', CardListCategoryTitle)

module.exports = {}
