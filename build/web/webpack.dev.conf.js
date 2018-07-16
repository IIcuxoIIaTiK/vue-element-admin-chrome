'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

const portfinder = require('portfinder')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const ZipFolder = require('zip-folder')
const ZipPlugin = require('zip-webpack-plugin')
const WebpackOnBuildPlugin = require('on-build-webpack')

function resolve (dir) {
  return path.join(__dirname, '..', '..', dir)
}

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: true,
    hot: true,
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      favicon: resolve('favicon.ico'),
      title: 'snk-vue-element-admin'
    }),
    /*
    new WebpackOnBuildPlugin(function(stats) {
      console.log('config.dev.tarballRoot=', config.dev.tarballRoot)
      console.log('config.dev.assetsRoot=', config.dev.assetsRoot)
      ZipFolder(config.dev.assetsRoot, config.dev.assetsRoot, function(err) {
        if(err) {
            console.log('oh no!', err);
        } else {
            console.log('EXCELLENT');
        }
      })
    })
    */
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      if (config.dev.webpackStats) {
        const WebpackOnBuildPlugin = require('on-build-webpack')
        const debug = require('util')
        devWebpackConfig.plugins.push(
          new WebpackOnBuildPlugin(function(stats) {
            /*
            console.log('config.dev.tarballRoot=', config.dev.tarballRoot)
            console.log('config.dev.assetsRoot=', config.dev.assetsRoot)
            ZipFolder(config.dev.assetsRoot, config.dev.assetsRoot, function(err) {
              if(err) {
                  console.log('oh no!', err);
              } else {
                  console.log('EXCELLENT');
              }
            })
            */
            // console.log('webpack.dev.stats: ', debug.inspect(stats, {depth: 2, maxArrayLength: 50, colors: true}))
          })
        )
      }

      resolve(devWebpackConfig)
    }
  })
})
