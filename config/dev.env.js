const { merge } = require('webpack-merge')
const prodEnv = require('./prod.env')

// Allows setting the NODE_ENV flag to 'production' when running the dev server
// This is useful for disabling strict mode in Vue, which has a considerable impact on performance
const NODE_ENV = process.env.NODE_ENV ? `"${process.env.NODE_ENV}"` : '"development"'

module.exports = merge(prodEnv, {
  NODE_ENV
})
