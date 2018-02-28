#!/bin/sh

npm run build

git add .
git commit -m '[deploy][skip ci]'
git push
