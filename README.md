# <img src="icons/favicon-32x32.png" /> FloorspaceJS

> a widget for creating 2d geometry for building energy models


## Getting Started

Read [the docs](https://nrel.github.io/floorspace.js/docs) then try out the [latest development version](https://nrel.github.io/floorspace.js/) in your browser.

## Build Setup

``` bash
# install node using nvm
$ nvm install 15
$ nvm use 15

# install and update dependencies (optional)
npm install

# install locked dependencies
npm ci

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build single page output for openstudio
npm run openstudio-build

# alternative if `npm run openstudio-build` does not work, build single page output for openstudio
npm run build
ruby build/build.rb

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

[Tests](https://travis-ci.org/NREL/floorspace.js) are run on each pull request. Current status: [![Build Status](https://travis-ci.org/NREL/floorspace.js.svg?branch=develop)](https://travis-ci.org/NREL/floorspace.js)

