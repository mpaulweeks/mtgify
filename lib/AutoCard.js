'use strict'

const Config = require('./Config')
const DeckList = require('./DeckList')
const HoverCard = require('./HoverCard')
const CardAPI = require('./CardAPI')

const cardApi = new CardAPI()
let uuid = 0

class _TextListener extends HTMLElement {
  connectedCallback() {
    this.setAttribute('data-autocard-id', uuid++)
    this.onInitTextListener()

    const self = this
    const callbackWrapper = function(evt) {
      const node = evt[0].addedNodes[0]
      if (node && node.nodeName === "#text"){
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
  onInitTextListener() {
    // do nothing, children override
  }
  handleInnerText(textContent) {
    // do nothing, children override
  }
}
class _AutoCard extends _TextListener {
  onInitTextListener() {
    this.anchor = document.createElement('a')
    this.anchor.setAttribute('target', '_blank')

    const nameAttr = this.getAttribute('name')
    if (nameAttr) {
      this.loadCardByName(nameAttr)
    }
  }
  handleInnerText(textContent) {
    this.customText = textContent
    if (!this.cardName){
      // read name from textContent
      this.loadCardByName(textContent)
    } else {
      // rerender cardName with new customText
      this.loadCardByName(this.cardName)
    }
  }
  loadCardByName(name) {
    this.cardName = name.trim()
    this.innerHTML = ''
    this.appendChild(this.anchor)
    this.anchor.setAttribute('href', this.getCardLink())

    let text = this.customText !== undefined ? this.customText : this.cardName
    const quantity = this.getAttribute('quantity')
    if (quantity){
      text = `${quantity}x ${text}`
    }
    this.anchor.innerHTML = text

    // todo replace with super call
    this.onInitAutoCard()
  }
  getConfig() {
    return Config({
      imgMagicCardsInfo: this.hasAttribute('imgMagicCardsInfo'),
      imgScryfall: this.hasAttribute('imgScryfall'),
      linkMagicCardsInfo: this.hasAttribute('linkMagicCardsInfo'),
      linkScryfall: this.hasAttribute('linkScryfall'),
      linkCombodeck: this.hasAttribute('linkCombodeck'),
    })
  }
  getCardLink() {
    const config = this.getConfig()
    const linkBase = (
      (config.linkScryfall && 'https://scryfall.com/search?q=') ||
      (config.linkMagicCards && 'http://magiccards.info/query?q=') ||
      (config.linkCombodeck && 'http://combodeck.net/Query/') ||
      'http://gatherer.wizards.com/Pages/Search/Default.aspx?name='
    )
    return linkBase + this.cardName
  }
  getCardInfo() {
    return cardApi.getCardInfo(this.cardName, this.getConfig())
  }
  onInitAutoCard() {
    // do nothing, children override
  }
}
class CardText extends _AutoCard {
  onInitAutoCard() {
    // todo wait for AutoCard to finish, even if its waiting for children
    // await name being set?
    this.onmouseover = evt => this.onMouseOver(evt)
    this.onmouseout = evt => this.onMouseOut(evt)
    this.imagePreviewId = this.getAttribute('data-preview')
    const previewElm = this.getPreview()
    if (previewElm){
      previewElm.loadDefault(this)
    }
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
  onInitAutoCard() {
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
class CardListPreview extends CardImage {
  loadDefault(elm) {
    if (!this.cardName) {
      this.loadCardByName(elm.cardName)
    }
  }
  show(elm, evt) {
    this.loadCardByName(elm.cardName)
  }
  hide(elm, evt) {
    // matcing HoverCard api
    // do nothing, let it linger
  }
}

class CardList extends _TextListener {
  onInitTextListener() {
    const listSrc = this.getAttribute('src')
    this.listTitle = document.createElement('card-list-title')
    this.container = document.createElement('card-list-container')
    this.appendChild(this.listTitle)
    this.appendChild(this.container)

    this.listTitle.innerHTML = this.getAttribute('name')

    if (this.hasAttribute('collapse')){
      this.renderHidden()
    } else {
      this.renderFull(listSrc)
    }
  }
  renderHidden() {
    const self = this
    self.container.innerHTML = ''
  }
  renderFull(listSrc) {
    const self = this;
    self.container.innerHTML = 'loading deck list...'
    const options = {}
    DeckList.DeckListFromUrl(listSrc, options, cardApi)
      .then(data => {
        self.container.innerHTML = ''

        const preview = self.hasAttribute('preview') ? document.createElement('card-list-preview') : null
        if (preview){
          self.container.appendChild(preview)
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
            if (preview) {
              cardText.setAttribute('data-preview', preview.uuid())
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
customElements.define('card-list-preview', CardListPreview)
customElements.define('card-list-category', CardListCategory)
customElements.define('card-list-category-title', CardListCategoryTitle)

module.exports = {}
