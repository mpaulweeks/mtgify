'use strict'

const DeckList = require('./DeckList')
const HoverCard = require('./HoverCard')
const CardAPI = require('./CardAPI')

let uuid = 0

class _TextListener extends HTMLElement {
  connectedCallback() {
    this.setAttribute('data-autocard-id', uuid++)
    this.onConnectedCallback()

    const self = this
    const callbackWrapper = function(evt) {
      const node = evt[0].addedNodes[0]
      if (node.nodeName == "#text"){
        self._observer.disconnect();
        node.remove()
        self.handleInnerText(node.textContent)
      }
    }
    self._observer = new MutationObserver(callbackWrapper)
    self._observer.observe(self, { childList: true })
  }
  uuid() {
    return this.getAttribute('data-autocard-id')
  }
  queryOther(uuid) {
    return document.querySelector(`*[data-autocard-id="${uuid}"`)
  }
  onConnectedCallback() {
    // do nothing, children override
  }
  handleInnerText(textContent) {
    // do nothing, children override
  }
}
class _AutoCard extends _TextListener {
  onConnectedCallback() {
    this.name = this.getAttribute('name')
    this.innerHTML = ''

    const url = `http://magiccards.info/query?q=${this.name}`
    this.anchor = document.createElement('a')
    this.appendChild(this.anchor)
    this.anchor.setAttribute('href', url)
    this.anchor.setAttribute('target', '_blank')

    let text = this.name
    const quantity = this.getAttribute('quantity')
    if (quantity){
      text = `${quantity}x ${text}`
    }
    this.anchor.innerHTML = text

    // todo replace with super call
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
    this.onmouseover = evt => this.onMouseOver(evt)
    this.onmouseout = evt => this.onMouseOut(evt)
    this.imagePreviewId = this.getAttribute('data-preview')
    const previewElm = this.getPreview()
    if (previewElm){
      previewElm.init(this)
    }
  }
  handleInnerText(textContent) {
    this.oldHTML = textContent
    this.anchor.innerHTML = this.oldHTML
  }
  getPreview() {
    const { imagePreviewId } = this
    return imagePreviewId ? this.queryOther(imagePreviewId) : null
  }
  getImageController() {
    return this.getPreview() || HoverCard
  }
  onMouseOver(evt) {
    this.getImageController().show(this, evt)
  }
  onMouseOut(evt) {
    this.getImageController().hide(this, evt)
  }
}
class CardImage extends _AutoCard {
  onLoad() {
    const self = this
    self.getCardInfo()
      .then(info => self.loadCardImage(info))
  }
  loadCardImage(info) {
    const image = document.createElement('img')
    image.setAttribute('src', info.imgUrl)
    image.setAttribute('alt', info.name)
    image.setAttribute('title', info.name)
    this.anchor.innerHTML = ''
    this.anchor.appendChild(image)
    this.image = image
  }
}
class CardListImage extends CardImage {
  onLoad() {
    this.defaultCard = null
    // do nothing, wait for caller
  }
  init(elm) {
    if (!this.defaultCard) {
      this.defaultCard = elm
      this.show(elm, null)
    }
  }
  show(elm, evt) {
    const self = this
    elm.getCardInfo()
      .then(info => self.loadCardImage(info))
  }
  hide(elm, evt) {
    // do nothing, let it linger
  }
}

class CardList extends _TextListener {
  onConnectedCallback() {
    const listSrc = this.getAttribute('src')
    this.listTitle = document.createElement('card-list-title')
    this.container = document.createElement('card-list-container')
    this.appendChild(this.listTitle)
    this.appendChild(this.container)
    if (this.hasAttribute('preview')){
      this.preview = document.createElement('card-list-preview')
    }
    this.renderText(listSrc)
  }
  renderText(listSrc) {
    const self = this;
    self.listTitle.innerHTML = this.getAttribute('name')
    self.container.innerHTML = 'loading deck list...'
    const options = {}
    DeckList.DeckListFromUrl(listSrc, options, cardName => CardAPI.getCardInfo(cardName))
      .then(data => {
        self.container.innerHTML = ''
        if (self.preview){
          self.container.appendChild(self.preview)
        }
        data.forEach(typeData => {
          const category = document.createElement('card-list-category')

          const categoryTitle = document.createElement('card-list-category-title')
          categoryTitle.innerHTML = typeData.type
          category.appendChild(categoryTitle)

          typeData.cards.forEach(card => {
            const cardText = document.createElement('card-text')
            category.appendChild(cardText)
            cardText.setAttribute('name', card.card.name)
            cardText.setAttribute('quantity', card.quantity)
            if (self.preview) {
              cardText.setAttribute('data-preview', self.preview.uuid())
            }
          })
          self.container.appendChild(category)
        })
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
customElements.define('card-list-preview', CardListImage)
customElements.define('card-list-category', CardListCategory)
customElements.define('card-list-category-title', CardListCategoryTitle)

module.exports = {}
