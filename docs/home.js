
const config = {
  enableAutoTag: true,
  excludeUnsets: true,
};
const AC = window.AUTOCARD
let cardName = ''

const imgSource = document.getElementById('imgSource');
const linkSource = document.getElementById('linkSource');
const randomButton = document.getElementById('random');
const snippetExmaple = document.getElementById('snippetExample');
const snippetLink = document.getElementById('snippetLink');

function getSourceOption(sourceName) {
  return `<option value=${sourceName}>${AC.constants.displayName[sourceName]}</option>`
}
imgSource.innerHTML = AC.constants.imgSources.map(getSourceOption).join('')
linkSource.innerHTML = AC.constants.linkSources.map(getSourceOption).join('')

function renderCard(){
  if (cardName === ''){
    snippetExample.innerHTML = 'loading...';
    AC.getRandomCard(config).then(card => {
      cardName = card.name;
      renderCard();
    })
  } else {
    snippetExample.innerHTML = cardName;
    AC.tagElement(snippetExample, config);
  }
}
function renderSnippet(){
  config.imgSource = imgSource.value;
  config.linkSource = linkSource.value;

  snippetLink.setAttribute('href', `javascript:(function(){window.AUTOCARD_CONFIG=${JSON.stringify(config)};document.body.appendChild(document.createElement('script')).src='https://autocard.mpaulweeks.com/dist/autocard.js';})();`);
  renderCard();
}
imgSource.onchange = renderSnippet;
linkSource.onchange = renderSnippet;
randomButton.addEventListener('click', () => {
  cardName = '';
  renderCard();
})
renderSnippet();
