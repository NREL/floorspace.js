# <img src="icons/favicon-32x32.png" /> FloorspaceJS

> a widget for creating 2d geometry for building energy models


## Getting Started

Read [the docs](https://nrel.github.io/floorspace.js/docs) then try out the [latest development version](https://nrel.github.io/floorspace.js/) in your browser.

## Build Setup

``` bash
# install node using nvm
$ nvm install 20
$ nvm use 20
$ npm install --global yarn

# install locked dependencies
yarn install --frozen-lockfile

# install and update dependencies (optional)
yarn install

# serve with hot reload at localhost:8080
yarn wp:dev

# build for production with minification
yarn wp:build

# build single page output for openstudio
yarn openstudio-build

# run unit tests
yarn run unit

# run e2e tests
yarn run e2e

# run performance tests (optional)
yarn perf
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

