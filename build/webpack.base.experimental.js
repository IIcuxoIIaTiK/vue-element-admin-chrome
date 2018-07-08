const path = require('path')
const webpack = require('webpack')
const pkg = require('../package.json')

const notifier = require('node-notifier')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteFileWebPackPlugin = require('write-file-webpack-plugin')
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
// local
const GenerateLocaleJsonPlugin = require('../plugins/GenerateLocaleJsonPlugin')
// const ChromeReloadPlugin = require('../dev/wcer')
const ChromeReloadPlugin = require('wcer')

const { cssLoaders, htmlPage } = require('./tools')

const rootDir = path.resolve(__dirname, '..')
const sourcePath = path.join(__dirname, 'src')
const outputPath = path.join(__dirname, 'dist')
const assetsOutputPath = 'static'
// const publicPath = isDevEnvironment ? '/' : './'
// const sourceMap = isDevEnvironment ? 'eval-source-map' : 'source-map'

// let resolve = (dir) => path.join(__dirname, '..', 'src', dir)
// let resolve = dir => path.join(rootDir, 'src', dir)
// let resolve = dir => path.join(__dirname, '..', 'src', dir)
// let resolve = dir => path.join(__dirname, '..', dir)

let resolve = (dir) => path.join(rootDir, 'src', dir)

module.exports = {
  entry: {
    // popup
    popup: resolve('./popup'),
    tab: resolve('./tab'),
    // options
    options: resolve('./options'),
    // content
    content: resolve('./content'),
    // devtool
    devtools: resolve('./devtools'),
    panel: resolve('./devtools/panel'),
    // background
    background: resolve('./background'),
  },
  output: {
    path: path.join(rootDir, 'dist'),
    publicPath: '/',
    filename: 'js/[name].js',
    chunkFilename: 'js/[id].[name].js?[hash]',
    jsonpFunction:'webpackJsonp',
    library: '[name]'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      // '@': resolve('src')      
      '@': path.join(rootDir, 'src')
    }
  },
  module: {
    rules: [
    {
      test: /\.(js|vue)$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      include: [ path.join(rootDir, 'src') ],
      // include: [path.join(rootDir, 'src'), path.join(__dirname, '..', 'test')],
      options: {
        formatter: require('eslint-friendly-formatter')
      }
    },
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        extractCSS: true,
        loaders: {
          ...cssLoaders(),
          js: { 
            loader: 'babel-loader'
            // options: {
            //  presets: ['es2015']
            // }
          }
        },
        transformToRequire: {
          video: 'src',
          source: 'src',
          img: 'src',
          image: 'xlink:href'
        }
      }
    }, 
    {
      test: /\.js$/,
      loader: 'babel-loader',
      include: [
        path.join(rootDir, 'src'),
        // https://github.com/sagalbot/vue-select/issues/71#issuecomment-229453096
        path.join(rootDir, 'node_modules', 'element-ui', 'src', 'utils')
      ]
    }, 
    {
      test: /\.js$/,
      loader: 'babel-loader',
      include:  [path.join(__dirname, '..', 'src'), path.join(__dirname, '..', 'test')],
    },
    {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'img/[name].[hash:7].[ext]'
      }
    },
    {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'media/[name].[hash:7].[ext]'
      }
    },
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'fonts/[name].[hash:7].[ext]'
      }
    }]
  },
  plugins: [
    new CleanWebpackPlugin(['*'], { root: path.join(rootDir, 'dist') }),
    // Customize your extension structure.
    // popup-tab
    htmlPage('home', 'app', ['manifest', 'vendor', 'tab']),
    htmlPage('popup', 'popup', ['manifest', 'vendor', 'popup']),
    // dev-tools
    htmlPage('panel', 'panel', ['manifest', 'vendor', 'panel']),
    htmlPage('devtools', 'devtools', ['manifest', 'vendor', 'devtools']),
    // options/settings page
    htmlPage('options', 'options', ['manifest', 'vendor', 'options']),
    // background scripts
    htmlPage('background', 'background', ['manifest', 'vendor', 'background']),
    // content scripts
    // htmlPage('content', 'content', ['manifest', 'vendor', 'content']),
    // End customize

    new CopyWebpackPlugin([
      {
        from: path.join(rootDir, 'static')
      }
    ]),

    new ChromeReloadPlugin({
      port: 9090,
      manifest: path.join(__dirname, '..', 'src', 'manifest.js')
    }),

    new GenerateLocaleJsonPlugin({
      _locales: path.join(__dirname, '..', 'src', '_locales')
    }),

    /*
    new webpack.optimize.CommonsChunkPlugin({ 
      name: 'vendor', 
      filename: '[name].[hash].js', 
      // filename: '[name]' + (prod ? '.[hash].js' : '.js'), 
      // const isProduction = process.env.NODE_ENV === 'production'
      minChunks: Infinity 
    }),
    */

    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {

        var vendorMinChunks = module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '..', 'node_modules')
          ) === 0

        if ( vendorMinChunks === true ) {
          console.log('vendorMinChunks: ', vendorMinChunks)
          console.log('module.resource: ', module.resource)
          console.log('module.resource.test.js: ', /\.js$/.test(module.resource))
          console.log('path.join(__dirname, \'../node_modules\'): ', path.join(__dirname, '../node_modules'))
        }

        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '..', 'node_modules')
          ) === 0
        )
      }
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    })    


  ],
  performance: { hints: false }
}

// module.exports.baseWebPackConfig = webpackConfig
// module.exports.sourcePath = sourcePath
// module.exports.outputPath = outputPath
// module.exports.assetsOutputPath = assetsOutputPath
