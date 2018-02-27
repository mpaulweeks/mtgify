
const CARD_HEIGHT = 311
const CARD_WIDTH = 220

const hp = document.createElement('div')
hp.style = "visibility: hidden; position: absolute;"
document.addEventListener("DOMContentLoaded", function() {
  document.body.appendChild(hp)
})

const hpImg = document.createElement('img')
hpImg.onerror = "this.onerror=null;this.onmouseout=null;this.onmouseover=null;hideImgPopup();"
hpImg.width = CARD_WIDTH
hpImg.height = CARD_HEIGHT
hp.appendChild(hpImg)

// heavily inspired by https://sites.google.com/site/themunsonsapps/mtg/autocard.js
// todo cleanup
function getTop(element, evt) {
  const body = document.body
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

function determineLeft(element, evt) {
  const body = document.body
  const padding = 10
  let shift = element.offsetLeft + element.offsetWidth + padding

  let tempElement = element;
  while (tempElement.offsetParent != null) {
    tempElement = tempElement.offsetParent;
    shift += tempElement.offsetLeft == null ? 0 : tempElement.offsetLeft;
  }

  if (body.offsetWidth < shift + CARD_WIDTH){
    shift = shift - (element.offsetWidth + CARD_WIDTH + (2*padding))
  }

  return shift;
}

function show(elm, evt) {
  console.log(evt)
  elm.getCardInfo()
    .then(info => {
      hp.setAttribute('data-mid', info.mid)

      hp.style.top = `${getTop(elm, evt)}px`
      hp.style.left = `${determineLeft(elm, evt)}px`

      hpImg.src = "" // this makes it disappear while loading new image
      hpImg.src = info.imgUrl
      hp.style.visibility = "Visible"
    })
}
function hide(elm, evt) {
  console.log(evt)
  elm.getCardInfo()
    .then(info => {
      if (hp.getAttribute('data-mid') === String(info.mid)) {
        hp.style.visibility = "Hidden"
      }
    })
}
function move(elm, evt) {
  // console.log(evt)
}

module.exports = {
  show,
  hide,
  move,
}
