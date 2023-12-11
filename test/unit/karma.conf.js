// This is a karma config file. For more details see
//   http://karma-runner.github.io/0.13/config/configuration-file.html
// we are also using it with karma-webpack
//   https://github.com/webpack/karma-webpack

process.env.CHROME_BIN = require('puppeteer').executablePath();

const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const baseConfig = require('../../build/webpack.base.conf');

const projectRoot = path.resolve(__dirname, '../../');

const webpackConfig = merge(baseConfig, {
  // use inline sourcemap for karma-sourcemap-loader
  browser: {
    child_process: 'empty',
    fs: 'empty',
  },
  devtool: 'cheap-module-source-map',
  vue: {
    loaders: {
      js: 'isparta',
    },
  },
  resolve: {
    src: path.resolve(__dirname, '../../src'),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../../config/test.env'),
    }),
  ],
});

// no need for app entry during tests
delete webpackConfig.entry;

// only apply babel for test files when using isparta
webpackConfig.module.rules.some((loader, i) => {
  if (loader.loader === 'babel') {
    loader.include = path.resolve(projectRoot, 'test/unit');
    return true;
  }
});

module.exports = function (config) {
  config.set({
    // to run in additional browsers:
    // 1. install corresponding karma launcher
    //    http://karma-runner.github.io/0.13/config/browsers.html
    // 2. add it to the `browsers` array below.
    browsers: ['ChromeHeadless'],
    frameworks: ['mocha', 'sinon-chai'],
    reporters: ['spec'],
    files: ['./index.js'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap'],
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true,
      stats: {
        chunks: false,
      },
    },
  });
};
