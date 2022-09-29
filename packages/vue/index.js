'use strict'

if (process.env.NODE_ENV === 'production') {
  // module.exports = require('./dist/vue.global.prod.js')
} else {
  module.exports = require('./dist/vue.global.js')
}
