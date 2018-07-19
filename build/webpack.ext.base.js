const path = require('path')
const fs = require('fs')

const webpack = require('webpack')
const chalk = require('chalk')
const debug = require('util')
const Module = require('module')

const _get = require('lodash/get')
const glob = require("glob")

const prettyJson = require('prettyjson')
const writeYaml = require('write-yaml')
const writeJson = require('write-json')
const pkg = require('../package.json')

const defaultManifest = require('../src/extension/manifest/manifest')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const ChromeReloadPlugin = require('wcer')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const GenerateLocaleJsonPlugin = require('./plugins/GenerateLocaleJsonPlugin')
const WebpackOnBuildPlugin = require('on-build-webpack')
const WebpackCdnPlugin = require('webpack-cdn-plugin')
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin")
const WebpackShellPlugin = require('webpack-shell-plugin')

const { cssLoaders, htmlPage } = require('./tools')
const vueLoaderConfig = require('./vue-loader.conf')
const rootDir = path.resolve(__dirname, '..')

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

process.traceDeprecation = true

let resolve = (dir) => path.join(rootDir, 'src', dir)

const extDestDir =  path.join(rootDir, 'dist', 'extension', 'chrome')
const extOutputDir = path.resolve('shared', 'dist', 'extension', 'chrome')
const extManifestBasename = path.resolve('shared', 'dist', 'extension', 'chrome', 'manifest')
const extManifestFile = path.resolve('shared', 'dist', 'extension', 'chrome', 'manifest.json')
console.log('!!!! destination dir: ', extDestDir)

// module.exports =
const UpdateManifest = (file = "", options = {drymode: false, browser: 'chrome', verbose: false}) => {
  var context = {
    cwd: '',
    build: {
      path: path.join('shared', 'dist', 'extension', 'chrome'),
      version: '',
      tag: ''
    },
    options: options,
    manifest: {
      filePath: file,
      original: {},
      next: {}
    },
    js: {
      build: {
        path: '',
        pattern: '',
        matches: {
          relative: [],
          filtered: []
        }
      }
    },
    css: {
      build: {
        path: '',
        pattern: '',
        matches: {
          relative: [],
          filtered: []
        }
      }
    }
  }
  context.cwd = process.cwd()
  context.js.defaultFiles = ['js/manifest.js', 'js/vendor.js', 'js/content.js']
  context.css.defaultFiles = ['css/content.css']

  fs.readFile(context.manifest.filePath, 'utf8', (err, content) => {
    ////////////////////////////////////////
    // manifest
    if (err) {
      // console.error('manifest.json does not exists, expected: ', context.manifest.filePath, ', error: ', err)
      context.manifest.original = defaultManifest // JSON.parse(defaultManifest)
    } else {
      context.manifest.original = JSON.parse(content.toString())
    }

    context.manifest.next =  context.manifest.original

    ////////////////////////////////////////
    // JS Files
    context.js.build.path = path.join(context.build.path, 'js')
    context.js.build.pattern = path.join(context.build.path, 'js', '*.*.js')

    if (fs.existsSync(context.js.build.path)) {
      // console.error('context.js.build.path does not exists, expected: ', context.js.build.path)
      // return

      const chunkJSfiles = glob.sync(context.js.build.pattern, {nodir: true})
      context.js.build.matches.found = chunkJSfiles

      chunkJSfiles.forEach(function(part, index, matches) {
        matches[index] = matches[index].replace(context.js.build.path, 'js')
      })
      context.js.build.matches.filtered = chunkJSfiles

      context.manifest.next.content_scripts[0].js = []
      // if (context.manifest.original.content_scripts[0].js !== undefined ) {
      //   context.manifest.next.content_scripts[0].js = context.manifest.original.content_scripts[0].js
      // }

      context.manifest.next.content_scripts[0].js.push('js/manifest.js')
      context.manifest.next.content_scripts[0].js.push('js/vendor.js')

      context.js.build.matches.filtered.forEach(function(part, index, matches) {
        context.manifest.next.content_scripts[0].js.push(matches[index])
      })
      context.manifest.next.content_scripts[0].js.push('js/content.js')
    }

    ////////////////////////////////////////
    // CSS Files
    context.css.build.path = path.join(context.build.path, 'css')
    context.css.build.pattern = path.join(context.build.path, 'css', 'content.*.css')

    if (fs.existsSync(context.css.build.path)) {
      // console.error('context.css.build.path does not exists, expected: ', context.css.build.path)
      // return

      const chunkCSSfiles = glob.sync(context.css.build.pattern, {nodir: true})
      context.css.build.matches.found = chunkCSSfiles
      chunkCSSfiles.forEach(function(part, index, matches) {
        matches[index] = matches[index].replace(context.css.build.path, 'css')
      })
      context.css.build.matches.filtered = chunkCSSfiles

      context.manifest.next.content_scripts[0].css = []
      // if (context.manifest.original.content_scripts[0].css !== undefined ) {
      //  context.manifest.next.content_scripts[0].css = context.manifest.original.content_scripts[0].css
      // }

      context.css.build.matches.filtered.forEach(function(part, index, matches) {
        context.manifest.next.content_scripts[0].css.push(matches[index])
      })

    }

    ////////////////////////////////////////
    // Verbose / Debug
    if (options.verbose) {
      // console.log('context.manifest.next: ', debug.inspect(context.manifest.next, {depth: 5, colors: true}))
      // console.log('options: ', debug.inspect(options, {depth: 5, colors: true}))
    }

    ////////////////////////////////////////
    // Output/Write Files
    if (!options.drymode) {
      // const data = context.manifest.next
      // console.log(prettyJson.render(context.manifest.next))

      ////////////////////////////////////////
      // Write JSON
      // console.log('writeJson, file=', file)
      writeJson.sync(file, context.manifest.next, {indent: 2})

      ////////////////////////////////////////
      // Write YAML
      const fileYaml = extManifestBasename+'.yaml'
      // console.log('writeYaml, file=', fileYaml)
      writeYaml.sync(fileYaml, context.manifest.next)
    }

    return
  })
}

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [
    resolve(''),
    resolve('test')
  ],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

module.exports = {
  entry: {
    // components
    // components: resolve('./components'),
    // popup
    popup: resolve('./extension/popup'),
    tab: resolve('./extension/tab'),
    // options
    options: resolve('./extension/options'),
    // content
    content: resolve('./extension/content'),
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
          name: 'img/[name].[hash:7].[ext]',
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
          name: 'media/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        options: {
          symbolId: 'icon-[name]'
        }
      },
      {
        test: /\.(woff2?|woff|eot|ttf|otf)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          limit: 10 * 1024,
          publicPath: 'chrome-extension://__MSG_@@extension_id__/', // isProduction ? 'chrome-extension://__MSG_@@extension_id__/' : '',
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  plugins: [
  	new CleanWebpackPlugin(['*'], { root: path.join(rootDir, 'shared', 'dist', 'extension', 'chrome')}),
    ////////////////////////////////////////////////////////
    ////
    //// [START] - Customize your extension structure.
    ////
    ////////////////////////////////////////////////////////
    // popup-tab
    htmlPage('home', 'app', ['manifest', 'vendor', 'tab']),
    htmlPage('popup', 'popup', ['manifest', 'vendor', 'popup']),
    ////////////////////////////////////////////////////////
    // dev-tools
    htmlPage('panel', 'panel', ['manifest', 'vendor', 'panel']),
    htmlPage('devtools', 'devtools', ['manifest', 'vendor', 'devtools']),
    ////////////////////////////////////////////////////////
    // options/settings page
    htmlPage('options', 'options', ['manifest', 'vendor', 'options']),
    ////////////////////////////////////////////////////////
    // background scripts
    htmlPage('background', 'background', ['manifest', 'vendor', 'background']),
    ////////////////////////////////////////////////////////
    // content scripts
    htmlPage('content', 'content', ['manifest', 'vendor', 'content']),
    ////////////////////////////////////////////////////////
    ////
    //// [END] - Customize your extension structure.
    ////
    ////////////////////////////////////////////////////////
    new CopyWebpackPlugin([{ from: path.join(rootDir, 'static') }]),
    new GenerateLocaleJsonPlugin({
      _locales: path.join(rootDir, 'src', '_locales')
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
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
    new WebpackOnBuildPlugin(function(stats) {
      // console.log('webpack.dev.stats: ', debug.inspect(stats.compilation.assets, {depth: 2, colors: true}))
      // var statsKeys = Object.keys(stats.compilation)
      // console.log('webpack.dev.statsKeys: ', debug.inspect(statsKeys, {depth: 2, colors: true}))
      const manifestOpts = {
        verbose: true,
        drymode: false,
        browser: 'chrome'
      }
      UpdateManifest(extManifestFile, manifestOpts)
    }),
  ],
  /*
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
  */
  performance: { hints: false }
}