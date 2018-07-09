const path = require('path')
const webpack = require('webpack')
const chalk = require('chalk')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ChromeReloadPlugin = require('wcer')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const GenerateLocaleJsonPlugin = require('../plugins/GenerateLocaleJsonPlugin')
const { cssLoaders, htmlPage } = require('./tools')

const rootDir = path.resolve(__dirname, '..')

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
    // components
    // components: resolve('./components'),
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
    library: '[name]'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.join(rootDir, 'src')
    }
  },
  module: {
    rules: [{
      test: /\.(js|vue)$/,
      loader: 'eslint-loader',
      enforce: 'pre',
      include: [ path.join(rootDir, 'src') ],
      options: { formatter: require('eslint-friendly-formatter') }
    }, {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        extractCSS: true,
        loaders: {
          ...cssLoaders(),
          js: { loader: 'babel-loader' }
        },
        transformToRequire: {
          video: 'src',
          source: 'src',
          img: 'src',
          image: 'xlink:href'
        }
      }

    // }, {
    //  test: /\.css$/,
    //  use: ["style-loader", "css-loader", "postcss-loader"]

    /*
    }, {
      test: /\.css$/,
      exclude: /node_modules/,
      use: [
          {
              loader: 'style-loader',
          },
          {
              loader: 'css-loader',
              options: {
                  importLoaders: 1,
              }
          },
          {
              loader: 'postcss-loader'
          }
      ]
    */

    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      include: [
        path.join(rootDir, 'src'),
        // https://github.com/sagalbot/vue-select/issues/71#issuecomment-229453096
        path.join(rootDir, 'node_modules', 'element-ui', 'src', 'utils')
      ]
    }, {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'img/[name].[hash:7].[ext]'
      }
    }, {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'media/[name].[hash:7].[ext]'
      }
    }, {
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
    htmlPage('content', 'content', ['manifest', 'vendor', 'content']),
    // components
    // htmlPage('components', 'components', ['manifest', 'vendor', 'components']),
    // End customize
    new CopyWebpackPlugin([{ from: path.join(rootDir, 'static') }]),
    /*
    new WebpackShellPlugin({
      onBuildEnd: ['node scripts/remove-evals.js'],
    }),
    */
    new ChromeReloadPlugin({
      port: 9090,
      manifest: path.join(rootDir, 'src', 'manifest.js')
    }),
    new GenerateLocaleJsonPlugin({
      _locales: path.join(rootDir, 'src', '_locales')
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      // minChunks: Infinity,
      // (with more entries, this ensures that no other module
      //  goes into the vendor chunk)
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
    })
  ],
  performance: { hints: false }
}