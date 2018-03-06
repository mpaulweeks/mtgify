'use strict'

// heavily inspired by https://sites.google.com/site/themunsonsapps/mtg/autocard.js

const CARD_HEIGHT = 310
const CARD_WIDTH = 223

const hp = document.createElement('div')
hp.style = "display: none; position: absolute;"
setTimeout(() => {
  // on document ready
  document.body.appendChild(hp)
})

const hpImg = document.createElement('img')
hpImg.onerror = "this.onerror=null;this.onmouseout=null;this.onmouseover=null;hideImgPopup();"
hpImg.width = CARD_WIDTH
hpImg.height = CARD_HEIGHT
hp.appendChild(hpImg)

function calcTop(element, evt) {
  const padding = element.offsetHeight
  let shift = element.offsetTop + padding

  let tempElement = element;
  while (tempElement.offsetParent != null) {
    tempElement = tempElement.offsetParent;
    shift += tempElement.offsetTop == null ? 0 : tempElement.offsetTop;
  }

  if (screen.height/2 < evt.screenY){
    shift = shift - (CARD_HEIGHT + padding)
  }

  return shift;
}
function calcLeft(element, evt) {
  const padding = 10
  let shift = evt.screenX + padding

  if (document.body.offsetWidth/2 < evt.screenX){
    shift = shift - (CARD_WIDTH + (2*padding))
  }

  return shift;
}

function show(elm, evt) {
  elm.getCardInfo()
    .then(info => {
      hp.setAttribute('data-mid', info.mid)

      hp.style.top = `${calcTop(elm, evt)}px`
      hp.style.left = `${calcLeft(elm, evt)}px`

      hpImg.src = "" // this makes it disappear while loading new image
      hpImg.src = info.imgUrl
      hp.style.display = "block"
    })
}
function hide(elm, evt) {
  elm.getCardInfo()
    .then(info => {
      if (hp.getAttribute('data-mid') === String(info.mid)) {
        hp.style.display = "none"
      }
    })
}
function move(elm, evt) {
}

module.exports = {
  show,
  hide,
  move,
}
