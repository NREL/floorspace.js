const path = require('path')
const config = require('../config')
const webpack = require('webpack')
const { merge } = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin');
const getBundleAnalyzer = require('./getBundleAnalyzer');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const env = process.env.NODE_ENV === 'testing'
  ? require('../config/test.env')
  : config.build.env

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: 4,
      }),
    ],
  },
  output: {
    filename: path.posix.join('static', 'js/[name].[chunkhash].js'),
    chunkFilename: path.posix.join('static', 'js/[id].[chunkhash].js')
  },
  plugins: [
    ...getBundleAnalyzer(),
    new webpack.DefinePlugin({
      'process.env': env,
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    }),
    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: path.posix.join('static', 'css/[name].[contenthash].css'),
    }),
    new FaviconsWebpackPlugin({
      logo: './icons/android-chrome-512x512.png',
      prefix: 'icons/',
      manifest: './src/manifest.json',
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing'
        ? 'index.html'
        : config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      excludeChunks: [ 'viewer' ]
    }),
    new HtmlWebpackPlugin({
     filename: path.join(config.build.assetsRoot, config.build.viewerSubDirectory, 'index.html'),
     template: './3DViewer/viewer/index.html',
     inject: true,
     minify: {
       removeComments: true,
       collapseWhitespace: true,
       removeAttributeQuotes: true
       // more options:
       // https://github.com/kangax/html-minifier#options-quick-reference
     },
     excludeChunks: [ 'app' ]
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './3DViewer/build/*js', to: "3DViewer/[name][ext]" },
        { from: './3DViewer/build/*wasm', to: "3DViewer/[name][ext]" },
        { from: './3DViewer/viewer/*js', to: "3DViewer/[name][ext]" },
        { from: './3DViewer/viewer/*css', to: "3DViewer/[name][ext]" },
      ]
    }),
  ]
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

module.exports = webpackConfig
