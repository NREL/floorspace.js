const config = require("../config");
const webpack = require("webpack");
const { merge } = require('webpack-merge');
const baseWebpackConfig = require("./webpack.base.conf");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "index.html",
      inject: true,
      chunks: ["app"],
    }),
    new HtmlWebpackPlugin({
      filename: "3DViewer/index.html",
      template: "./3DViewer/viewer/index.html",
      inject: true,
      chunks: ["viewer"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './3DViewer/build/*js', to: "3DViewer/[name][ext]" },
        { from: './3DViewer/build/*wasm', to: "3DViewer/[name][ext]" },
        { from: './3DViewer/viewer/*js', to: "3DViewer/[name][ext]" },
        { from: './3DViewer/viewer/*css', to: "3DViewer/[name][ext]" },
      ]
    }),
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
