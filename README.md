# mtg-toolbox

[![CircleCI](https://circleci.com/gh/mpaulweeks/mtg-toolbox/tree/master.svg?style=svg)](https://circleci.com/gh/mpaulweeks/mtg-toolbox/tree/master)

assorted tools for MTG apps

## \<card-text> usage

Import the stylesheet and script in your document's head
```html
<link rel="stylesheet" href="http://autocard.mpaulweeks.com/dist/autocard.css">
<script src="http://autocard.mpaulweeks.com/dist/autocard.js"></script>
```
Make tags either in HTML or via JS
```html
<card-text>Dark Confidant</card-text>
<card-text name="Dark Confidant">Bob</card-text>
<card-image>Bitter Blossom</card-image>
```
See the [example folder](/docs/example) for more
