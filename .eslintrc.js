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
    'camelcase': 0, // We have tons of camelcase identifiers, because the spec calls for it
    'func-names': 0, // not every anonymous function should be an arrow func.
    'no-mixed-operators': 0, // many 5th graders know PEMDAS.
    'no-console': 0, // logging is healthy. logging is good.
    'no-cond-assign': [2, 'except-parens'],
  }
};
