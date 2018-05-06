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
        self._observer.disconnect()
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
      if (self.hasAttribute(flag)){
        customConfig[flag] = self.getAttribute(flag)
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
    if (!info){
      // do nothing
      return
    }
    const image = document.createElement('img')
    image.setAttribute('src', info.imgUrl)
    image.setAttribute('alt', info.name)
    image.setAttribute('title', info.name)
    this.anchor.innerHTML = ''
    this.anchor.appendChild(image)
    this.image = image

    const quantity = parseInt(this.getAttribute('quantity') || "1", 10)
    if (quantity > 1){
      const quantityMarker = document.createElement('auto-card-image-quantity')
      quantityMarker.innerHTML = 'x' + quantity
      this.anchor.appendChild(quantityMarker)
    }
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
    // matching HoverCard api
    // do nothing, let it linger
  }
}
class CardListToggle extends HTMLElement {
  addListener(callback, state){
    if (!this.callback) {
      const self = this
      self.addEventListener('click', () => self.onClick())
    }
    this.state = state
    this.callback = () => callback(this.state)
    this.render()
  }
  onClick(){
    this.state = !this.state
    this.render()
    this.callback()
  }
  render(){
    this.innerHTML = this.state ? '(expand)' : '(hide)'
  }
}
class CardList extends _TextListener {
  onInitTextListener() {
    this.collapsed = true
    this.canCollapse = this.hasAttribute('collapse')
    this.listToggle = document.createElement('auto-card-list-toggle')
    this.listToggle.addListener(state => this.toggle(state), this.collapsed)

    this.deckOptions = {}
    const listSrc = this.getAttribute('src')
    if (listSrc) {
      this.loadDeckData(DeckList.DeckListFromUrl(listSrc, this.deckOptions, cardApi))
    }
  }
  handleInnerText(textContent) {
    if (!this.deckDataPromise) {
      this.loadDeckData(DeckList.DeckListFromText(textContent, this.deckOptions, cardApi))
    }
  }
  loadDeckData(deckDataPromise) {
    this.deckDataPromise = deckDataPromise
    this.render()
  }
  toggle(state) {
    this.collapsed = state
    this.render()
  }
  render() {
    const self = this
    self.innerHTML = 'loading deck list...';
    self.deckDataPromise.then(deckData => {
      self.innerHTML = '';
      self.renderHead(deckData)
      if (self.canCollapse && self.collapsed){
        // do nothing
      } else {
        self.renderBody(deckData)
      }
    })
  }
  renderHead(deckData) {
    const { meta } = deckData
    const name = this.getAttribute('name') || meta.name
    const info = this.getAttribute('info') || meta.info
    const link = this.getAttribute('link') || meta.link
    const listHead = document.createElement('auto-card-list-head')

    if (name) {
      const listName = document.createElement('auto-card-list-name')
      listHead.appendChild(listName)
      listName.innerHTML = name
    }
    if (info){
      const listInfo = document.createElement('auto-card-list-info')
      listHead.appendChild(listInfo)
      listInfo.innerHTML = `${ info }`
    }
    if (link){
      const listLink = document.createElement('auto-card-list-link')
      listHead.appendChild(listLink)
      listLink.innerHTML = `<a href="${ link.url }">${ link.label }</a>`
    }
    if (name || info || link){
      this.appendChild(listHead)
      if (this.canCollapse) {
        listHead.appendChild(this.listToggle)
      }
    }
  }
  renderBody(deckData) {
    const { deckList } = deckData;

    const listBody = document.createElement('auto-card-list-body')
    this.appendChild(listBody)

    const self = this
    const showImages = self.hasAttribute('showImages')
    if (!showImages) {
      const textContainer = document.createElement('auto-card-list-text-container')
      listBody.appendChild(textContainer)

      const preview = !showImages && self.hasAttribute('preview') && document.createElement('auto-card-list-preview')
      if (preview) {
        textContainer.appendChild(preview)
        preview.setAttribute('imgSource', self.getAttribute('imgSource'))
        preview.setAttribute('linkSource', self.getAttribute('linkSource'))
      }

      deckList.forEach(typeData => {
        const category = document.createElement('auto-card-list-category')

        const categoryType = document.createElement('auto-card-list-category-type')
        categoryType.innerHTML = `${typeData.type} (${typeData.count})`
        category.appendChild(categoryType)

        typeData.cards.forEach(card => {
          const cardElm = document.createElement('auto-card')
          category.appendChild(cardElm)
          self.applyConfig(cardElm, card)
          if (preview) {
            cardElm.setAttribute('data-preview', preview.uuid())
          }
        })
        textContainer.appendChild(category)
      })
    } else {
      const imageList = document.createElement('auto-card-list-image-container')
      deckList.forEach(typeData => {
        typeData.cards.forEach(card => {
          const cardElm = document.createElement('auto-card-image')
          imageList.appendChild(cardElm)
          self.applyConfig(cardElm, card)
        })
      })
      listBody.appendChild(imageList)
    }
  }
  applyConfig(childElm, card) {
    childElm.setAttribute('name', card.card.name)
    childElm.setAttribute('quantity', card.quantity)
    childElm.setAttribute('imgSource', this.getAttribute('imgSource'))
    childElm.setAttribute('linkSource', this.getAttribute('linkSource'))
  }
}
class CardListDiff extends _TextListener {
  handleInnerText(textContent) {
    const options = {}
    const self = this
    const head = document.createElement('auto-card-list-diff-head')
    const body = document.createElement('auto-card-list-diff-body')
    self.metaList = document.createElement('auto-card-list')
    self.cutsList = document.createElement('auto-card-list')
    self.addsList = document.createElement('auto-card-list')
    head.appendChild(self.metaList)
    body.appendChild(self.cutsList)
    body.appendChild(self.addsList)
    self.appendChild(head)
    self.appendChild(body)
    DeckList.DeckListFromText(textContent, options, cardApi)
      .then(deckData => {
        const { meta, cuts, adds } = deckData;
        self.metaList.loadDeckData(new Promise((resolve, reject) => {
          resolve({
            meta: meta,
            deckList: [],
          })
        }))
        self.cutsList.loadDeckData(new Promise((resolve, reject) => {
          resolve({
            meta: {
              name: 'Cuts',
            },
            deckList: cuts,
          })
        }))
        self.addsList.loadDeckData(new Promise((resolve, reject) => {
          resolve({
            meta: {
              name: 'Adds',
            },
            deckList: adds,
          })
        }))
      })
  }
}

class CardImageQuantity extends HTMLElement {}
class CardListDiffHead extends HTMLElement {}
class CardListDiffBody extends HTMLElement {}
class CardListHead extends HTMLElement {}
class CardListName extends HTMLElement {}
class CardListInfo extends HTMLElement {}
class CardListLink extends HTMLElement {}
class CardListBody extends HTMLElement {}
class CardListCategory extends HTMLElement {}
class CardListCategoryType extends HTMLElement {}
class CardListTextContainer extends HTMLElement {}
class CardListImageContainer extends HTMLElement {}

customElements.define('auto-card', CardText)
customElements.define('auto-card-image', CardImage)
customElements.define('auto-card-image-quantity', CardImageQuantity)
customElements.define('auto-card-list-diff', CardListDiff)
customElements.define('auto-card-list-diff-head', CardListDiffHead)
customElements.define('auto-card-list-diff-body', CardListDiffBody)
customElements.define('auto-card-list', CardList)
customElements.define('auto-card-list-head', CardListHead)
customElements.define('auto-card-list-toggle', CardListToggle)
customElements.define('auto-card-list-name', CardListName)
customElements.define('auto-card-list-info', CardListInfo)
customElements.define('auto-card-list-link', CardListLink)
customElements.define('auto-card-list-body', CardListBody)
customElements.define('auto-card-list-preview', CardListPreview)
customElements.define('auto-card-list-category', CardListCategory)
customElements.define('auto-card-list-category-type', CardListCategoryType)
customElements.define('auto-card-list-text-container', CardListTextContainer)
customElements.define('auto-card-list-image-container', CardListImageContainer)

return {}
}
