
const hp = document.createElement('div')
let currentImgSrc = null
hp.style = "visibility: hidden; position: absolute;"
document.addEventListener("DOMContentLoaded", function() {
  document.body.appendChild(hp)
})

// heavily inspired by https://sites.google.com/site/themunsonsapps/mtg/autocard.js
// todo cleanup
var CARD_HEIGHT = 310;
var CARD_WIDTH = 220;
var body = document.body
function getTop(element) {
  // height margin
  var OFFSET_TOP = 0;
  var tempElement = element;
  var top = 0;

  while(tempElement.offsetParent!=null){
    tempElement = tempElement.offsetParent;
    top+=tempElement.offsetTop==null?0:tempElement.offsetTop;
  }
  top+= element.offsetTop + element.offsetHeight;
  top+= OFFSET_TOP;

  if(body!=null && body.offsetHeight!=null && body.offsetHeight<top+CARD_HEIGHT+(2*BORDER_WIDTH)){
    top = body.offsetHeight - CARD_HEIGHT - OFFSET_TOP- (2 * BORDER_WIDTH);
  }

  return top;
}
function determineLeft(element) {
  // width margin
  var OFFSET_LEFT = 0;
  var tempElement = element;
  var left = 0;
  while(tempElement.offsetParent!=null){
    tempElement = tempElement.offsetParent;
    left+=tempElement.offsetLeft==null?0:tempElement.offsetLeft;
  }
  left+= element.offsetLeft + element.offsetWidth;
  left+= OFFSET_LEFT;

  if(body!=null && body.offsetWidth!=null && body.offsetWidth<left+CARD_WIDTH+(2*BORDER_WIDTH)){
    left = body.offsetWidth - CARD_WIDTH - OFFSET_LEFT - (2 * BORDER_WIDTH);
  }
  return left;
}
function getOffset( el ) {
  return isNaN(el) ? 0:el;
}

function show(elm) {
  elm.getCardInfo()
    .then(info => {
      hp.setAttribute('data-mid', info.multiverseid)

      hp.style.top = getTop(elm)+"px"
      hp.style.left = determineLeft(elm)+"px"

      hp.innerHTML = "<img src=\""+info.imgUrl+"\" onerror=\"this.onerror=null;this.onmouseout=null;this.onmouseover=null;hideImgPopup();\" width=\""+CARD_WIDTH+"\" height=\""+CARD_HEIGHT+"\"/>"
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
