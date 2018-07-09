const webpack = require('webpack')
// const webpack = require('webpack-stream')
const merge = require('webpack-merge')
const ZipPlugin = require('zip-webpack-plugin')
const ZipFolder = require('zip-folder')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const baseWebpack = require('./webpack.base')
const { styleLoaders, increaseVersion } = require('./tools')

module.exports = merge(baseWebpack, {
  module: { rules: styleLoaders({ extract: true, sourceMap: true }) },
  // devtool: '#cheap-module-source-map',
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    /*
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new WebpackOnBuildPlugin(stats => {
      increaseVersion(manifest)
      try {
        fs.writeFileSync(manifestSrcPath, JSON.stringify(manifest, null, 2))
        fs.writeFileSync(manifestDistPath, JSON.stringify(manifest, null, 2))
      } catch (e) {
        console.log(
          chalk.red('\n  update manifest(dist) file error: ' + e.message)
        )
      }
      console.log(chalk.cyan('\n  manifest file updated successfully'))

      zipFolder('./dist/', './ext.zip', err => {
        if (err) {
          console.log(chalk.red('Failed to zip dist folder ' + err))
        } else {
          console.log(chalk.cyan('An zip of ext is available in ./ext.zip'))
        }
      })
    }),
    */
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
    new OptimizeCSSPlugin({ cssProcessorOptions: { safe: true } }),
    new ExtractTextPlugin({ filename: 'css/[name].css' }),
    // new ExtractTextPlugin({ filename: 'css/[name].[contenthash].css' }),
    new webpack.HashedModuleIdsPlugin(),
    new ZipPlugin({
      path: '..',
      filename: 'eadmin-extension.prod.zip'
    })
  ]
})