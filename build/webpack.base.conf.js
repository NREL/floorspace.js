const path = require("path");
const { VueLoaderPlugin } = require('vue-loader')

const cwd = process.cwd();

module.exports = {
  entry: {
    app: "./src/main.js"
    //DLM: comment 3DViewer out for now
    //viewer: "./3DViewer/viewer/index.js",
  },
  output: {
    path: path.resolve(cwd, 'dist'),
    publicPath: '/',
    filename: "[name].js",
  },
  resolve: {
    extensions: ["", ".js", ".vue", ".json"],
    alias: {
      vue$: "vue/dist/vue.common.js",
      src: path.resolve(cwd, "src"),
      assets: path.resolve(cwd, "src/assets"),
      components: path.resolve(cwd, "src/components"),
    },
  },
  plugins: [
    new VueLoaderPlugin(),
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
        loader: "vue-svg-loader",
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
