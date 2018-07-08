const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const offlinePlugin = require('offline-plugin') // production only
const ZipPlugin = require('zip-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const baseWebpack = require('./webpack.base')
const { styleLoaders, htmlPage } = require('./tools')
// const productionGzip = false



module.exports = merge(baseWebpack, {
  devtool: '#cheap-module-eval-source-map',
  // devtool: '#cheap-module-source-map',
  // devtool: '#cheap-module-eval-source-map',
  module: { rules: styleLoaders({ extract: true, sourceMap: true }) },
  plugins: [
    /*
    htmlPage('home', 'app', ['manifest', 'vendor', 'tab']),
    htmlPage('popup', 'popup', ['manifest', 'vendor', 'popup']),
    htmlPage('panel', 'panel', ['manifest', 'vendor', 'panel']),
    htmlPage('devtools', 'devtools', ['manifest', 'vendor', 'devtools']),
    htmlPage('options', 'options', ['manifest', 'vendor', 'options']),
    htmlPage('background', 'background', ['manifest', 'vendor', 'background']),
    htmlPage('content', 'content', ['manifest', 'vendor', 'content']),
    */
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
    new OptimizeCSSPlugin({ cssProcessorOptions: { safe: true } }),
    new ExtractTextPlugin({ filename: 'css/[name].[contenthash].css' }),
    new webpack.HashedModuleIdsPlugin(),
    new ZipPlugin({
      path: '..',
      filename: 'extension.zip'
    })
  ]
})
