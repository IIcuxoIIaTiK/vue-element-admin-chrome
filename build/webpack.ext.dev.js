const webpack = require('webpack')
const merge = require('webpack-merge')
const debug = require('util')
const path = require('path')

const ChromeReloadPlugin = require('wcer')
const WebpackDevServer = require('webpack-dev-server')
const WebpackOnBuildPlugin = require('on-build-webpack')
const WriteFilePlugin = require('write-file-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader')
const WebpackShellPlugin = require('webpack-shell-plugin')
const WebpackCdnPlugin = require('webpack-cdn-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

const baseWebpack = require('./webpack.ext.base')
const { styleLoaders, increaseVersion } = require('./tools')

/*
  Refs:
  - https://github.com/YuraDev/vue-chrome-extension-template/blob/master/template/core/webpack.dev.js
  - https://github.com/cucygh/vue-chrome-extension-example/blob/master/app/scripts/background.js
  - https://github.com/ik9999/popupsearch/blob/master/webpack.config.js#/components/automate/selector
*/

module.exports = merge(baseWebpack, {
  watch: true,
  module: { rules: styleLoaders({ sourceMap: false }) },
  devtool: '#cheap-module-source-map',
  // devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    // new WriteFilePlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),
    // new OptimizeCSSPlugin({ cssProcessorOptions: { safe: true } }),
    new ExtractTextPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    new FriendlyErrorsPlugin(),
    new ZipPlugin({
      path: path.resolve(__dirname, '..', 'shared', 'tarball', 'extension', 'chrome'),
      filename: 'extension.dev.zip'
    }),
    new ChromeReloadPlugin({
      port: 9090,
      manifest: path.resolve(__dirname, '..', 'src', 'extension', 'manifest', 'manifest.js')
    }),
  ]
})
