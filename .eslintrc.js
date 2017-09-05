module.exports = {
  'extends': 'eslint-config-airbnb',
  'env': {
    'browser': true,
  },
  'plugins': ['html'],
  'rules': {
    'no-param-reassign': ['error', {
      props: false
    }],
    'dot-notation': 0,
    'no-plusplus': ['error', {
      'allowForLoopAfterthoughts': true
    }],
    'max-len': ['error', 200, 2, {
      'ignoreUrls': true,
      'ignoreComments': false,
      'ignoreRegExpLiterals': true,
      'ignoreStrings': true,
      'ignoreTemplateLiterals': true
    }],
    'one-var': 0,
    'one-var-declaration-per-line': 0,
    'no-nested-ternary': 0,
  }
};
