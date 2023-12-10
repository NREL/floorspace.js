const path = require("path");

const cwd = process.cwd();

module.exports = {
  entry: {
    app: "./src/main.js",
    viewer: "./3DViewer/viewer/index.js",
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
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue",
      },
      {
        test: /\.(js|jsx|ts|tsx)?$/,
        exclude: [/node_modules/],
        loader: "babel-loader",
      },
      {
        test: /\.(jpe?g|png|gif|svg|mp3|pdf|csv|xlsx|ttf|woff(2)?)$/i,
        type: "asset/resource",
      },
      {
        test: /\.svg$/,
        loader: "vue-svg-loader",
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: { importLoaders: 1 }
          },
          'postcss-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
    ],
  },
};
