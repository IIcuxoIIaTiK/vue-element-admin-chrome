const webpack = require('webpack')
const merge = require('webpack-merge')
const debug = require('util')
const path = require('path')
// const webpack = require('webpack-stream')

const WebpackDevServer = require('webpack-dev-server')
const WebpackOnBuildPlugin = require('on-build-webpack')
const WriteFilePlugin = require('write-file-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader')
const WebpackShellPlugin = require('webpack-shell-plugin')
const WebpackCdnPlugin = require('webpack-cdn-plugin')
const ZipPlugin = require('zip-webpack-plugin')
// const VueLoaderPlugin = require('vue-loader/lib/plugin')

const baseWebpack = require('./webpack.ext.base')
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

    /*
    new WebpackCdnPlugin({
      modules: [
        {
          name: 'vue',
          var: 'Vue',
          style: 'dist/vue.css'
        },
        {
          name: 'vue-router'
        }
      ],
      publicPath: path.join(__dirname, '../node_modules')
    }),
    */

    new WebpackOnBuildPlugin(function(stats) {
      console.log('webpack.dev.stats: ', debug.inspect(stats, {depth: 2, maxArrayLength: 50, colors: true}))
      // console.log('webpack.dev.stats: ', JSON.stringify(stats, null, 2))
    }),

    /*
    new webpack.HotModuleReplacementPlugin(),

    new ChromeExtensionReloader({
      entries: {
        background: 'background',
        options: 'options',
        popup: 'popup',
        contentScripts: 'contentScripts/index',
      },
    }),
    */

    new ZipPlugin({
      // path: '..',
      path: path.resolve(__dirname, '..', 'tarball', 'extension', 'chrome'),
      filename: 'extension.dev.zip'
    })
    // new ProgressBarPlugin()
  ]
})