const path = require('path')
const webpack = require('webpack')
const chalk = require('chalk')
const debug = require('util')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const ChromeReloadPlugin = require('wcer')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const GenerateLocaleJsonPlugin = require('./plugins/GenerateLocaleJsonPlugin')
const WebpackOnBuildPlugin = require('on-build-webpack')
const WebpackCdnPlugin = require('webpack-cdn-plugin')
// const VueLoaderPlugin = require('vue-loader/lib/plugin')

const { cssLoaders, htmlPage } = require('./tools')
const vueLoaderConfig = require('./vue-loader.conf')
const rootDir = path.resolve(__dirname, '..')

let resolve = (dir) => path.join(rootDir, 'src', dir)

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
    path: path.join(rootDir, 'dist', 'extension', 'chrome'),
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
    },
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      // options: vueLoaderConfig
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
    /*
    {
      test: /\.scss$/,
      use: ["vue-style-loader", "css-loader", "sass-loader"],
    },
    */
    {
      test: /\.svg$/,
      loader: 'svg-sprite-loader',
      include: [resolve('icons')],
      options: {
        symbolId: 'icon-[name]'
      }
    },
    {
      test: /\.(gql|graphql)$/,
      loader: "graphql-tag/loader",
    },
    {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'img/[name].[hash:7].[ext]'
      }
    },
    /*
    {
      test: /\.(jpg|jpeg|png|gif|ico|svg)$/,
      use: 'file-loader?name=[name].[ext]'
    },
    */
    {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'media/[name].[hash:7].[ext]'
      }
    },
    {
      test: /\.(woff2?|woff|eot|ttf|otf)(\?.*)?$/,
      // use: 'file-loader?name=[name].[hash:7].[ext]'
      use: 'file-loader?name=[name].[ext]'
    },

    /*
    {
      test: /\.(png|jpg|gif|svg|ico)$/,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]?emitFile=false',
      }
    },
    */
    /*
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        // limit: 10000,
        name: 'fonts/[name].[ext]?emitFile=false'
      }
    }
    */
    /*,
    {
      test: /(fontawesome.js)$/,
      use: 'file-loader?name=[name].[ext]'
    },{
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'fonts/[name].[hash:7].[ext]'
      }
    }*/
    ]
  },
  plugins: [
    // path.join(rootDir, 'dist')
  	new CleanWebpackPlugin(['*'], { root: path.join(rootDir, 'dist', 'extension', 'chrome')}),
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
      manifest: path.join(rootDir, 'src', 'extension', 'manifest.js')
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
      console.log('webpack.dev.stats: ', debug.inspect(stats, {depth: 2, colors: true}))
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