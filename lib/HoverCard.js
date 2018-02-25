
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
function getTop(element) {
  const body = document.body
  let shift = element.offsetTop

  let tempElement = element;
  while (tempElement.offsetParent != null) {
    tempElement = tempElement.offsetParent;
    shift += tempElement.offsetTop == null ? 0 : tempElement.offsetTop;
  }

  // todo screen height
  if (body.offsetHeight < shift + CARD_HEIGHT){
    shift = shift - (CARD_HEIGHT - element.offsetHeight)
  }

  return shift;
}

function determineLeft(element) {
  const body = document.body
  let shift = element.offsetLeft + element.offsetWidth + 10

  let tempElement = element;
  while (tempElement.offsetParent != null) {
    tempElement = tempElement.offsetParent;
    shift += tempElement.offsetLeft == null ? 0 : tempElement.offsetLeft;
  }

  // todo screen width
  if (body.offsetWidth < shift + CARD_WIDTH){
    shift = shift - (element.offsetWidth + CARD_WIDTH)
  }

  return shift;
}

function show(elm) {
  elm.getCardInfo()
    .then(info => {
      hp.setAttribute('data-mid', info.multiverseid)

      hp.style.top = `${getTop(elm)}px`
      hp.style.left = `${determineLeft(elm)}px`

      hpImg.src = "" // this makes it disappear while loading new image
      hpImg.src = info.imgUrl
      hp.style.visibility = "Visible"
    })
}
function hide(elm) {
  elm.getCardInfo()
    .then(info => {
      if (hp.getAttribute('data-mid') === String(info.multiverseid)) {
        hp.style.visibility = "Hidden"
      }
    })
}

module.exports = {
  show,
  hide,
}
