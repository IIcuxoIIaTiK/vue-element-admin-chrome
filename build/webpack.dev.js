const webpack = require('webpack')
const merge = require('webpack-merge')
const WebpackDevServer = require('webpack-dev-server')
const WebpackOnBuildPlugin = require('on-build-webpack')
const WriteFilePlugin = require('write-file-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const baseWebpack = require('./webpack.base')
const { styleLoaders, increaseVersion } = require('./tools')

module.exports = merge(baseWebpack, {
  watch: true,
  module: { rules: styleLoaders({ sourceMap: false }) },
  // module: { rules: styleLoaders({ extract: true, sourceMap: false }) },
  devtool: '#cheap-module-source-map',
  // devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    // new WriteFilePlugin(),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"development"' }),
    // new OptimizeCSSPlugin({ cssProcessorOptions: { safe: true } }),
    new FriendlyErrorsPlugin(),
    new ZipPlugin({
      path: '..',
      filename: 'eadmin-extension.dev.zip'
    })
    // new ProgressBarPlugin()
  ]
})