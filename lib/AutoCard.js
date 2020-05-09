'use strict'

const Constants = require('./Constants')
const Config = require('./Config')
const DeckList = require('./DeckList')
const HoverCard = require('./HoverCard')

module.exports = (cardApi) => {

let uuid = 0

class _TextListener extends HTMLElement {
  connectedCallback() {
    // record before any alterations
    const textContent = this.textContent

    this.setAttribute('data-autocard-id', uuid++)
    this.onInitTextListener()

    if (textContent) {
      // firefox and safari load HTML before script
      this.textContent = ""
      this.handleInnerText(textContent)
    } else {
      // chrome sees textContent as mutation
      const self = this
      const callbackWrapper = function(evt) {
        // console.log(evt)
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
    this.getCardLink().then(link => {
      if (link){
        this.anchor.setAttribute('href', link)
      }
    })

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
    const customConfig = {}
    const self = this
    Constants.configAttrs.forEach(flag => {
      if (self.hasAttribute(flag)){
        customConfig[flag] = self.getAttribute(flag)
      }
    })
    return Config(customConfig)
  }
  getCardLink() {
    return this.getCardInfo().then(cardInfo => {
      if (!cardInfo) {
        return
      }
      const { name, mid } = cardInfo
      const config = this.getConfig()
      switch (config.linkSource) {
        case Constants.linkSource.magicCardsInfo:
        case Constants.linkSource.scryfall:
          return String.raw`https://scryfall.com/search?q=name:/(?<=\/\/ |^)${name}(?= \/\/|$)/`
        case Constants.linkSource.comboDeck:
          return 'http://combodeck.net/Query/' + name
        case Constants.linkSource.urzaCo:
          return 'https://urza.co/m/cards?q=' + name
        default:
          return 'https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=' + mid
      }
    })
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
    this.listToggleContainer = document.createElement('auto-card-list-head')
    this.listToggleContainer.appendChild(this.listToggle)

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
      self.renderBody(deckData)
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
    }
  }
  renderBody(deckData) {
    const { cuts, adds, deckList } = deckData
    const hasChanges = cuts || adds
    if (hasChanges) {
      const diff = document.createElement('auto-card-list-diff')
      this.renderDecklist(cuts, diff, 'Cuts', false);
      this.renderDecklist(adds, diff, 'Adds', false);
      this.appendChild(diff)
    }
    if (this.canCollapse) {
      this.appendChild(this.listToggleContainer)
    }
    const isCollapsed = this.canCollapse && this.collapsed
    if (deckList && !isCollapsed) {
      this.renderDecklist(deckList, this, hasChanges && 'Deck List', true);
    }
  }
  renderDecklist(deckList, parent, title, canPreview) {
    const listBody = document.createElement('auto-card-list-body')
    parent.appendChild(listBody)

    if (title) {
      const listHead = document.createElement('auto-card-list-head')
      const listName = document.createElement('auto-card-list-name')
      listHead.appendChild(listName)
      listBody.appendChild(listHead)
      listName.innerHTML = title
    }

    const self = this
    const showImages = self.hasAttribute('showImages')
    if (!showImages) {
      const textContainer = document.createElement('auto-card-list-text-container')
      listBody.appendChild(textContainer)

      const preview = canPreview && self.hasAttribute('preview') && document.createElement('auto-card-list-preview')
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

class CardImageQuantity extends HTMLElement {}
class CardListHead extends HTMLElement {}
class CardListName extends HTMLElement {}
class CardListInfo extends HTMLElement {}
class CardListLink extends HTMLElement {}
class CardListDiff extends HTMLElement {}
class CardListBody extends HTMLElement {}
class CardListCategory extends HTMLElement {}
class CardListCategoryType extends HTMLElement {}
class CardListTextContainer extends HTMLElement {}
class CardListImageContainer extends HTMLElement {}

function defineCustomElement(tagName, classRef) {
  if (customElements.get(tagName) === undefined) {
    customElements.define(tagName, classRef)
  }
}
defineCustomElement('auto-card', CardText)
defineCustomElement('auto-card-image', CardImage)
defineCustomElement('auto-card-image-quantity', CardImageQuantity)
defineCustomElement('auto-card-list', CardList)
defineCustomElement('auto-card-list-head', CardListHead)
defineCustomElement('auto-card-list-toggle', CardListToggle)
defineCustomElement('auto-card-list-name', CardListName)
defineCustomElement('auto-card-list-info', CardListInfo)
defineCustomElement('auto-card-list-link', CardListLink)
defineCustomElement('auto-card-list-diff', CardListDiff)
defineCustomElement('auto-card-list-body', CardListBody)
defineCustomElement('auto-card-list-preview', CardListPreview)
defineCustomElement('auto-card-list-category', CardListCategory)
defineCustomElement('auto-card-list-category-type', CardListCategoryType)
defineCustomElement('auto-card-list-text-container', CardListTextContainer)
defineCustomElement('auto-card-list-image-container', CardListImageContainer)

return {}
}
