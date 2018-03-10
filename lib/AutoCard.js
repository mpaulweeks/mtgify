'use strict'

const Constants = require('./Constants')
const Config = require('./Config')
const DeckList = require('./DeckList')
const HoverCard = require('./HoverCard')

module.exports = (cardApi) => {

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
    const flags = [
      'imgSource',
      'linkSource',
    ]
    const customConfig = {}
    const self = this
    flags.forEach(flag => {
      if (this.hasAttribute(flag)){
        customConfig[flag] = this.getAttribute(flag)
      }
    })
    return Config(customConfig)
  }
  getCardLink() {
    const config = this.getConfig()
    let linkBase = ''
    switch (config.linkSource) {
      case Constants.linkSource.scryfall:
        linkBase = 'https://scryfall.com/search?q='
        break
      case Constants.linkSource.magicCardsInfo:
        linkBase = 'http://magiccards.info/query?q='
        break
      case Constants.linkSource.comboDeck:
        linkBase = 'http://combodeck.net/Query/'
        break
      case Constants.linkSource.urzaCo:
        linkBase = 'https://urza.co/cards/search?q='
        break
      default:
        linkBase = 'http://gatherer.wizards.com/Pages/Search/Default.aspx?name='
    }
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
    this.listTitle = document.createElement('auto-card-list-title')
    this.container = document.createElement('auto-card-list-container')
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

        const preview = self.hasAttribute('preview') ? document.createElement('auto-card-list-preview') : null
        if (preview){
          self.container.appendChild(preview)
          preview.setAttribute('imgSource', self.getAttribute('imgSource'))
          preview.setAttribute('linkSource', self.getAttribute('linkSource'))
        }

        data.forEach(typeData => {
          const category = document.createElement('auto-card-list-category')

          const categoryTitle = document.createElement('auto-card-list-category-title')
          categoryTitle.innerHTML = `${typeData.type} (${typeData.count})`
          category.appendChild(categoryTitle)

          typeData.cards.forEach(card => {
            const cardText = document.createElement('auto-card')
            category.appendChild(cardText)
            cardText.setAttribute('name', card.card.name)
            cardText.setAttribute('quantity', card.quantity)
            cardText.setAttribute('imgSource', self.getAttribute('imgSource'))
            cardText.setAttribute('linkSource', self.getAttribute('linkSource'))
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

customElements.define('auto-card', CardText)
customElements.define('auto-card-image', CardImage)
customElements.define('auto-card-list', CardList)
customElements.define('auto-card-list-title', CardListTitle)
customElements.define('auto-card-list-container', CardListContainer)
customElements.define('auto-card-list-preview', CardListPreview)
customElements.define('auto-card-list-category', CardListCategory)
customElements.define('auto-card-list-category-title', CardListCategoryTitle)

return {}
}
