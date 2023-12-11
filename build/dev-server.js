require("./check-versions")();
const config = require("../config");
if (!process.env.NODE_ENV)
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV);
const path = require("path");
const express = require("express");
const webpack = require("webpack");
const opn = require("opn");
const proxyMiddleware = require("http-proxy-middleware");
const webpackConfig =
  process.env.NODE_ENV === "testing"
    ? require("./webpack.prod.conf")
    : require("./webpack.dev.conf");

// default port where dev server listens for incoming traffic
const port = process.env.PORT || config.dev.port;
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
const proxyTable = config.dev.proxyTable;

const app = express();
const compiler = webpack(webpackConfig);

// serve pure static assets
const staticPath = path.posix.join(
  config.dev.assetsPublicPath,
  config.dev.assetsSubDirectory
);
app.use(staticPath, express.static("./static"));
//DLM: comment 3DViewer out for now
//app.use(
//  path.posix.join(config.dev.assetsPublicPath, "3DViewer/"),
//  express.static("./3DViewer/build/")
//);

var devMiddleware = require("webpack-dev-middleware")(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: {
    colors: true,
    chunks: false,
  },
});

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context];
  if (typeof options === "string") {
    options = { target: options };
  }
  app.use(proxyMiddleware(context, options));
});

// handle fallback for HTML5 history API
app.use(
  require("connect-history-api-fallback")({
    rewrites: [{ from: /\/3DViewer/, to: "/3DViewer/index.html" }],
  })
);

// serve webpack bundle output
app.use(devMiddleware);

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  var uri = "http://localhost:" + port;
  console.log("Listening at " + uri + "\n");

  // when env is testing, don't need open it
  if (process.env.NODE_ENV !== "testing") {
    opn(uri);
  }
});
