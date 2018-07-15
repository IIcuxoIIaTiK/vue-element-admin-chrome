const path = require('path')
const webpack = require('webpack')
const chalk = require('chalk')
const debug = require('util')

// const prettyPrint = require('prettyprint')
// import prettyprint from 'prettyprint'

const CleanWebpackPlugin = require('clean-webpack-plugin')
const ChromeReloadPlugin = require('wcer')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const GenerateLocaleJsonPlugin = require('./plugins/GenerateLocaleJsonPlugin')
const WebpackOnBuildPlugin = require('on-build-webpack')
const WebpackCdnPlugin = require('webpack-cdn-plugin')
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin")
// const VueLoaderPlugin = require('vue-loader/lib/plugin')

const { cssLoaders, htmlPage } = require('./tools')
const vueLoaderConfig = require('./vue-loader.conf')
const rootDir = path.resolve(__dirname, '..')

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

process.traceDeprecation = true

let resolve = (dir) => path.join(rootDir, 'src', dir)

console.log('!!!! destination dir: ', path.join(rootDir, 'dist', 'extension', 'chrome'))

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve(''), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

module.exports = {
  entry: {
    // popup
    popup: resolve('./extension/popup'),
    tab: resolve('./extension/tab'),
    // options
    options: resolve('./extension/options'),
    // content
    content: resolve('./extension/content'),
    // components
    // components: resolve('./components'),
    // devtool
    devtools: resolve('./extension/devtools'),
    panel: resolve('./extension/devtools/panel'),
    // background
    background: resolve('./extension/background'),
  },
  output: {
    path: path.join(rootDir, 'shared', 'dist', 'extension', 'chrome'),
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
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [ path.join(rootDir, 'src') ],
        options: { formatter: require('eslint-friendly-formatter') }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // options: vueLoaderConfig
        options: {
          extractCSS: true,
          loaders: {
            // https://github.com/babel/babel-loader#options
            ...cssLoaders(),
            js: { loader: 'babel-loader' },
            cacheDirectory: true,
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
        // exclude: /(node_modules|bower_components)/,
        include: [
          path.join(rootDir, 'src'),
          // https://github.com/sagalbot/vue-select/issues/71#issuecomment-229453096
          path.join(rootDir, 'node_modules', 'element-ui', 'src', 'utils')
        ]
      },
      {
        test: /\.(gql|graphql)$/,
        loader: "graphql-tag/loader",
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[ext]?[hash:7]',
          exclude: [
            path.join(rootDir, 'src', 'components', 'admin-lite', 'icons')
          ]
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[ext]?[hash:7]'
        }
      },

      /*
      {
        test: /\.svg$/,
        loader: 'svg-url-loader',
        include: [
          path.join(rootDir, 'src', 'assets', 'icons'),
          path.join(rootDir, 'src', 'components', 'admin-lite', 'icons')
        ],
        options: {
          limit: 1 * 1024,
          publicPath: 'chrome-extension://__MSG_@@extension_id__/', // isProduction ? 'chrome-extension://__MSG_@@extension_id__/' : '',
          noquotes: true,
          symbolId: 'icon-[name]',
          name: 'assets/svg/[name].[ext]?[hash:7]' // utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      */


      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        // include: [
          // path.join(rootDir, 'src'),
          // path.join(rootDir, 'src', 'assets', 'icons'),
          // path.join(rootDir, 'src', 'components', 'admin-lite', 'icons')
        // ],
        options: {
          // extract: true,
          // spriteFilename: 'css/svg.[ext]?[hash:7]',
          symbolId: 'icon-[name]'
        }
      },

      /*
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: [
          path.join(rootDir, 'src', 'assets', 'icons'),
          path.join(rootDir, 'src', 'components', 'admin-lite', 'icons')
        ],
        options: {
          limit: 1 * 1024,
          publicPath: 'chrome-extension://__MSG_@@extension_id__/',
          noquotes: true,
          symbolId: 'icon-[name]',
          name: 'assets/svg/[name].[ext]?[hash:7]' // utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      */

      {
        test: /\.(woff2?|woff|eot|ttf|otf)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          limit: 10 * 1024,
          publicPath: 'chrome-extension://__MSG_@@extension_id__/', // isProduction ? 'chrome-extension://__MSG_@@extension_id__/' : '',
          name: 'fonts/[name].[ext]?[hash:7]'
        }
      }
    ]
  },
  plugins: [
    // path.join(rootDir, 'dist')
  	new CleanWebpackPlugin(['*'], { root: path.join(rootDir, 'shared', 'dist', 'extension', 'chrome')}),
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
      manifest: path.join(rootDir, 'src', 'extension', 'manifest', 'manifest.js')
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
    }),

    /*
    new WebpackShellPlugin({
      onBuildEnd: ['node build/check-evals.js'],
    }),
    */

    /*
    new WebpackOnBuildPlugin(function(stats) {
      console.log('webpack.dev.stats: ', debug.inspect(stats.compilation.assets, {depth: 2, colors: true}))
      // var statsKeys = Object.keys(stats.compilation)
      // console.log('webpack.dev.statsKeys: ', debug.inspect(statsKeys, {depth: 2, colors: true}))
    }),
    */

  ],
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  performance: { hints: false }
}