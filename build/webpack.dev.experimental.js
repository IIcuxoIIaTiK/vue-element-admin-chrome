const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpack = require('./webpack.base')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
// const {styleLoaders} = require('./tools')
const { styleLoaders, htmlPage } = require('./tools')

const devServerHost = process.env.HOST || 'localhost'
const devServerPort = process.env.PORT || '3000'
const testsPath = path.join(__dirname, 'test')

module.exports = merge(baseWebpack, {
  // watch: true,
  // module: { rules: styleLoaders({ extract: true, sourceMap: false }) },
  module: {
    rules: styleLoaders({ 
      sourceMap: false 
    })
  },
  devtool: '#cheap-module-eval-source-map',
  // devtool: '#cheap-module-source-map',
  // devtool: '#cheap-module-eval-source-map',
  plugins: [
    /*
    htmlPage('home', 'app', ['tab']),
    htmlPage('popup', 'popup', ['popup']),
    htmlPage('panel', 'panel', ['panel']),
    htmlPage('devtools', 'devtools', ['devtools']),
    htmlPage('options', 'options', ['options']),
    htmlPage('background', 'background', ['background']),
    htmlPage('content', 'content', ['content']),
    */
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),
    /*
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
    */
    new FriendlyErrorsPlugin()
  ]
})
