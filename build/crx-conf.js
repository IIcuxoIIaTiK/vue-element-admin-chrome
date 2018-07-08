const { resolve } = require('./utils')

module.exports = {
  name: 'chrome-ext',
  outputPath: resolve(),
  keyPath: resolve('key.pem'),
  contentPath: resolve('dist')
}
