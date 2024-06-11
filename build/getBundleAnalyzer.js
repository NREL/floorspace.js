const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const getBundleAnalyzer = () => {
  if (process.env.BUNDLE_ANALYZER === 'true') {
    // eslint-disable-next-line
    console.log('bundle analyzer enabled');

    return [
      new BundleAnalyzerPlugin(),
    ];
  }

  // eslint-disable-next-line
  console.log('bundle analyzer disabled');

  return [
  ];
};

module.exports = getBundleAnalyzer;
