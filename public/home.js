
const config = {
  enableAutoTag: true,
  popupAutoTag: true,
  ignoreCase: false,
  excludeUnsets: true,
};
const AC = window.MTGIFY
let cardName = ''

const imgSource = document.getElementById('imgSource');
const linkSource = document.getElementById('linkSource');
const thirdParties = document.getElementById('thirdParties');
const randomButton = document.getElementById('random');
const snippetExmaple = document.getElementById('snippetExample');
const snippetLink = document.getElementById('snippetLink');
const jsonUpdated = document.getElementById('jsonUpdated');
const jsonVersion = document.getElementById('jsonVersion');
const updatedElms = Array.from(document.getElementsByClassName('updated'));
const exampleRow = document.getElementById('exampleRow');

function getSourceOption(sourceName) {
  return `<option value=${sourceName}>${AC.constants.displayName[sourceName]}</option>`
}
imgSource.innerHTML = AC.constants.imgSources.map(getSourceOption).join('');
linkSource.innerHTML = AC.constants.linkSources.map(getSourceOption).join('');

function getPartnerLink(sourceName) {
  const url = AC.constants.displayUrls[sourceName];
  const name = AC.constants.displayName[sourceName];
  return `<a href="${url}">${name}</a>`;
}
thirdParties.innerHTML = AC.constants.partners.map(getPartnerLink).join(' / ');

function renderCard(newCard) {
  snippetExample.innerHTML = 'loading...';
  if (cardName === '') {
    AC.getRandomCard(config).then(card => {
      cardName = card.name;
      renderCard(true);
    })
  } else {
    snippetExample.innerHTML = cardName;
    AC.tagElement(snippetExample, config);
    if (!newCard) {
      updatedElms.forEach(elm => elm.classList.remove('updated-fade-out'));
      setTimeout(() => {
        updatedElms.forEach(elm => elm.classList.add('updated-fade-out'));
      }, 1000);
    }
  }
}
function renderSnippet() {
  config.imgSource = imgSource.value;
  config.linkSource = linkSource.value;

  snippetLink.setAttribute('href', `javascript:(function(){window.MTGIFY_CONFIG=${JSON.stringify(config)};document.body.appendChild(document.createElement('script')).src='https://mtgify.org/dist/autocard.js?v='+(new Date().getTime());})();`);
  renderCard();
}
imgSource.onchange = renderSnippet;
linkSource.onchange = renderSnippet;
randomButton.addEventListener('click', () => {
  cardName = '';
  renderCard();
})
renderSnippet();

Promise.all([AC.getRandomCard(), AC.getRandomCard(), AC.getRandomCard()]).then(cards => {
  exampleRow.innerHTML += cards.map(card => `<auto-card-image>${card.name}</auto-card-image>`).join('');
});

MTGIFY.getVersion()
  .then(vData => {
    jsonUpdated.innerHTML = vData.updated.substring(0, 10);
    jsonVersion.innerHTML = vData.version;
  })
