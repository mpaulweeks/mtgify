# mtg-toolbox

[![CircleCI](https://circleci.com/gh/mpaulweeks/mtg-toolbox/tree/master.svg?style=svg)](https://circleci.com/gh/mpaulweeks/mtg-toolbox/tree/master)

assorted tools for MTG apps

## \<auto-card> usage

Import the stylesheet and script in your document's head
```html
<link rel="stylesheet" href="http://autocard.mpaulweeks.com/dist/autocard.css">
<script src="http://autocard.mpaulweeks.com/dist/autocard.js"></script>
```
Make tags either in HTML or via JS
```html
<auto-card>Dark Confidant</auto-card>
<auto-card name="Dark Confidant">Bob</auto-card>
<auto-card-image>Umezawa's Jitte</auto-card-image>
```
See the [example folder](/docs/example) for more
