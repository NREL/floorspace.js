const config = require("../config");
const webpack = require("webpack");
const { merge } = require('webpack-merge');
const baseWebpackConfig = require("./webpack.base.conf");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const cwd = process.cwd();
const outputPath = path.resolve(cwd, 'dist');

module.exports = merge(baseWebpackConfig, {
  target: 'web',
  mode: 'development',
  devtool: 'cheap-module-source-map',
  plugins: [
    new webpack.DefinePlugin({
      "process.env": config.dev.env,
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "index.html",
      inject: true,
      chunks: ["app"],
    }),
    //DLM: comment 3DViewer out for now
    //new HtmlWebpackPlugin({
    //  filename: "3DViewer/index.html",
    //  template: "./3DViewer/viewer/index.html",
    //  inject: true,
    //  chunks: ["viewer"],
    //}),
  ],
  devServer: {
    static: {
      directory: outputPath,
    },
    allowedHosts: 'all',
    historyApiFallback: {
      disableDotRule: true,
    },
    hot: true,
    compress: true,
    open: true,
    liveReload: false,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    devMiddleware: {
      writeToDisk: true,
    },
  },
});
