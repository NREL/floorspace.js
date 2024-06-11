const path = require("path");
const { VueLoaderPlugin } = require('vue-loader')
const CopyPlugin = require("copy-webpack-plugin");

const cwd = process.cwd();

const output = path.resolve(cwd, 'dist');

module.exports = {
  entry: {
    app: "./src/main.ts",
    viewer: "./3DViewer/viewer/index.js",
  },
  output: {
    path: output,
    publicPath: '/',
    filename: "[name].js",
  },
  resolve: {
    extensions: ["", ".js", ".vue", ".json", ".ts", ".tsx"],
    alias: {
      src: path.resolve(cwd, "src"),
      assets: path.resolve(cwd, "src/assets"),
      components: path.resolve(cwd, "src/components"),
    },
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyPlugin({
      patterns: [
        { from: "site.webmanifest", to: output },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        exclude: [/node_modules/],
        loader: "babel-loader",
      },
      {
        test: /\.svg$/,
        use: [
          'vue-loader',
          'vue-svg-loader',
        ],
      },
      {
        test: /\.(jpe?g|png|gif|mp3|pdf|csv|xlsx|ttf|woff(2)?)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
    ],
  },
};
