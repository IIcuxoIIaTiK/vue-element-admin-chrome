'use strict'
// Template version: 1.2.6
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

module.exports = {
  rootDir: path.resolve(__dirname, '..', '..'),
  dev: {

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {},

    // Various Dev Server settings
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 9528, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: true,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

    // Use Eslint Loader?
    // If true, your code will be linted during bundling and
    // linting errors and warnings will be shown in the console.
    useEslint: true,
    // If true, eslint errors and warnings will also be shown in the error overlay
    // in the browser.
    showEslintErrorsInOverlay: true,

    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false,

    // generate tarball
    generateTarball: false,

    // Template for index.html
    // index: path.resolve(__dirname, '..', '..', 'shared', 'dist', 'web/index.html'),
    // assetsRoot: path.resolve(__dirname, '..', '..', 'shared', 'dist', 'web'),

    tarballRoot: path.resolve(__dirname, '..', '..', 'shared', 'tarball', 'web'),

    // callback for webpack stats
    webpackStats: false,

    // generate embeddable binary data for Golang based programs
    generateBindata: true,

    // generate embeddable binary data shell command
    generateBindataCmd: [
      'bindata',
      '-ignore=\\\.DS_Store', '-ignore=\\\.secret', '-ignore=\\\.env',
      '-pkg', 'main',
      '-o', path.resolve(__dirname, '..', '..', 'shared', 'dist', 'bindata', 'dev', 'gz-bindata.go'),
      path.join('shared', 'dist', 'web', '...')
    ]

  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '..', '..', 'shared', 'dist', 'web/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '..', '..', 'shared', 'dist', 'web'),
    assetsSubDirectory: 'static',

    tarballRoot: path.resolve(__dirname, '..', '..', 'shared', 'tarball', 'web'),

    /**
     * You can set by youself according to actual condition
     * You will need to set this if you plan to deploy your site under a sub path,
     * for example GitHub pages. If you plan to deploy your site to https://foo.github.io/bar/,
     * then assetsPublicPath should be set to "/bar/".
     * In most cases please use '/' !!!
     */
    assetsPublicPath: '/admin/', // If you are deployed on the root path, please use '/'

    /**
     * Source Maps
     */

    productionSourceMap: false,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // callback for webpack stats
    webpackStats: false,

    // generate embeddable binary data for Golang based programs
    generateBindata: true,

    // generate embeddable binary data shell command
    generateBindataCmd: [
      'bindata',
      '-ignore=\\\.DS_Store', '-ignore=\\\.secret', '-ignore=\\\.env',
      '-pkg', 'main',
      '-o', path.resolve(__dirname, '..', '..', 'shared', 'dist', 'bindata', 'prod', 'gz-bindata.go'),
      path.join('shared', 'dist', 'web', '...')
    ],

    // generate tarball
    generateTarball: false,

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: true,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report

  }
}
