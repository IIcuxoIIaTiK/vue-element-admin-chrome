const webpack = require('webpack')
const merge = require('webpack-merge')
const debug = require('util')
const path = require('path')
// const webpack = require('webpack-stream')

const ZipPlugin = require('zip-webpack-plugin')
const ZipFolder = require('zip-folder')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const WebpackShellPlugin = require('webpack-shell-plugin')
const WebpackCdnPlugin = require('webpack-cdn-plugin')
const WebpackOnBuildPlugin = require('on-build-webpack')
// const VueLoaderPlugin = require('vue-loader/lib/plugin')

const baseWebpack = require('./webpack.ext.base')
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

    new OptimizeCSSPlugin({ cssProcessorOptions: { safe: true } }),
    new ExtractTextPlugin({ filename: 'css/[name].css' }),
    // new ExtractTextPlugin({ filename: 'css/[name].[contenthash].css' }),
    new webpack.HashedModuleIdsPlugin(),

    /*
    new WebpackOnBuildPlugin(function(stats) {
      console.log('webpack.prod.stats: ', debug.inspect(stats.compilation.assets, {depth: 1, maxArrayLength: 10, colors: true}))
    }),
    */

    new ZipPlugin({
      path: path.resolve(__dirname, '..', 'tarball', 'extension', 'chrome'),
      filename: 'extension.prod.zip'
    })

  ]
})

/*
// chain custom plugins based on env vrariables
if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
  ])
} else {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.HotModuleReplacementPlugin(),
    new ChromeExtensionReloader({
      entries: {
        background: 'background',
        options: 'options',
        popup: 'popup',
        contentScripts: 'contentScripts/index',
      },
    }),
  ])
}
*/