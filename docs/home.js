
const config = {
  enableAutoTag: true,
};

const imgSource = document.getElementById('imgSource');
const linkSource = document.getElementById('linkSource');
const snippetExmaple = document.getElementById('snippetExample');
const snippetLink = document.getElementById('snippetLink');

function renderSnippet(){
  config.imgSource = imgSource.value;
  config.linkSource = linkSource.value;

  snippetLink.setAttribute('href', `javascript:(function(){window.AUTOCARD_CONFIG=${JSON.stringify(config)};document.body.appendChild(document.createElement('script')).src='https://autocard.mpaulweeks.com/dist/autocard.js';})();`);

  // todo random card
  snippetExample.innerHTML = 'Force of Will';
  window.AUTOCARD.tagElement(snippetExample, config);
}

// todo use constants to populate selects

imgSource.onchange = renderSnippet;
linkSource.onchange = renderSnippet;
renderSnippet();
