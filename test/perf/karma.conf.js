// This is a karma config file. For more details see
//   http://karma-runner.github.io/0.13/config/configuration-file.html
// we are also using it with karma-webpack
//   https://github.com/webpack/karma-webpack

process.env.CHROME_BIN = require("puppeteer").executablePath();

const path = require("path");
const { merge } = require("webpack-merge");
const baseConfig = require("../../build/webpack.base.conf");
const webpack = require("webpack");
const projectRoot = path.resolve(__dirname, "../../");

const webpackConfig = merge(baseConfig, {
  // use inline sourcemap for karma-sourcemap-loader
  browser: {
    child_process: "empty",
    fs: "empty",
  },
  devtool: "cheap-module-source-map",
  vue: {
    loaders: {
      js: "isparta",
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": require("../../config/prod.env"),
    }),
  ],
  resolve: {
    alias: {
      Src: path.resolve(__dirname, "../../src/"),
    },
  },
});

// no need for app entry during tests
delete webpackConfig.entry;

// make sure isparta loader is applied before eslint
webpackConfig.module.preLoaders = webpackConfig.module.preLoaders || [];
webpackConfig.module.preLoaders.unshift({
  test: /\.js$/,
  loader: "isparta",
  include: path.resolve(projectRoot, "src"),
});

// only apply babel for test files when using isparta
webpackConfig.module.loaders.some(function (loader, i) {
  if (loader.loader === "babel") {
    loader.include = path.resolve(projectRoot, "test/perf");
    return true;
  }
});

module.exports = function (config) {
  config.set({
    // to run in additional browsers:
    // 1. install corresponding karma launcher
    //    http://karma-runner.github.io/0.13/config/browsers.html
    // 2. add it to the `browsers` array below.
    browsers: ["FixedWindowChrome"],
    frameworks: ["mocha", "sinon-chai"],
    reporters: ["log-reporter", "spec"],
    files: ["./index.js"],
    preprocessors: {
      "./index.js": ["webpack", "sourcemap"],
    },
    logReporter: {
      outputPath: path.resolve(__dirname, "output"),
      outputName: "perf.log",
      filter_key: "performance-test",
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true,
      stats: {
        chunks: false,
      },
    },
    customLaunchers: {
      FixedWindowChrome: {
        base: "Chrome",
        flags: ["--window-size=1600,900"],
      },
    },
    singleRun: true,
  });
};
