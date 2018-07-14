/**
 * @see {@link https://developer.chrome.com/extensions/manifest}
 */
module.exports = {
  name: '__MSG_extName__', // Vue Extension
  description: '__MSG_extDescription__', // Vue.js Webpack Chrome Extension Template
  author: 'Rosco Pecoltran <rosco_pecoltran@msn.com>',
  version: '1.0.0',
  icons: {
    '16': 'icons/16.png',
    '128': 'icons/128.png'
  },
  /**
   * @see {@link https://developer.chrome.com/extensions/declare_permissions}
   */

  permissions: [
    'activeTab',
    'tabs',
    'background',
    'unlimitedStorage',
    'storage',
    'downloads',
    'bookmarks',
    'topSites',
    'nativeMessaging',
    'unlimitedStorage',
    'contextMenus',
    'cookies',
    "webNavigation",
    'notifications',
    'tabCapture',
    'clipboardWrite',
    'clipboardRead',
    'http://github.com/',
    'https://github.com/',
    'https://libraries.io/api/',
    'http://localhost:3000/api/',
    'https://localhost:3000/api/',
    'chrome://favicon/',
    'http://*/*',
    'https://*/*',
    'https://assets-cdn.github.com/*',
    'https://camo.githubusercontent.com/*'
  ],
  chrome_url_overrides: {
    'newtab': 'pages/app.html'
  },
  browser_action: {
    default_title: 'title',
    default_popup: 'pages/popup.html'
  },
  commands: {
    add_to_queue: {
      suggested_key: {
        default: 'Alt+Q',
        mac: 'Alt+Q'
      },
      description: 'Add Current page to Queue'
    },
    add_to_bookmarks: {
      suggested_key: {
        default: 'Alt+B',
        mac: 'Alt+B'
      },
      description: 'Add Current page to Bookmarks'
    }
  },
  background: {
    persistent: false,
    page: 'pages/background.html'
  },
  devtools_page: 'pages/devtools.html',

  options_page: 'pages/options.html',
  content_scripts: [{
    css: [
      'css/content.css'
    ],
    js: [
      'js/manifest.js',
      'js/vendor.js',

      'js/0.0.js',
      'js/1.1.js',
      'js/2.2.js',
      'js/3.3.js',
      'js/4.4.js',
      'js/5.5.js',
      'js/6.6.js',
      'js/7.7.js',
      'js/8.8.js',
      'js/9.9.js',

      'js/10.10.js',
      'js/11.11.js',

      /*
      'js/12.12.js',
      'js/13.13.js',
      'js/14.14.js',
      'js/15.15.js',
      'js/16.16.js',
      'js/17.17.js',
      'js/18.18.js',
      'js/19.19.js',
      */

      'js/20.20.js',

      /*
      'js/21.21.js',
      'js/22.22.js',
      'js/23.23.js',
      'js/24.24.js',
      'js/25.25.js',

      'js/34.34.js',
      */

      'js/content.js'
    ],
    // run_at: 'document_end',
    run_at: 'document_idle',
    matches: [
      // '<all_urls>',
      'https://github.com/*'
    ],
    all_frames: false
  }],
  default_locale: 'en',
  manifest_version: 2,
  content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",
  // "default-src 'self'; connect-src *;",
  // content_security_policy: "default-src 'self'; connect-src *; script-src 'self' 'unsafe-eval' https://ssl.google-analytics.com https://fonts.googleapis.com https://code.jquery.com; object-src 'self'; font-src 'self' 'unsafe-inline' data:font/tff data:font/woff",
  web_accessible_resources: [
    'panel.html',
    "icons/*.*",
    "img/*.*",
    "*.eot",
    "*.ttf",
    "*.woff",
    "*.woff2",
    "fonts/*.*",
    "css/*.*",
    'js/content.js'
  ]
}
