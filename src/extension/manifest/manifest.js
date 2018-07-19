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
    'webRequestBlocking',
    'clipboardWrite',
    'clipboardRead',
    'http://github.com/',
    'https://github.com/',
    'https://fonts.gstatic.com/s/materialicons*',
    'https://fonts.googleapis.com/css?family=*',
    'https://fonts.googleapis.com/css?family=Open+Sans',
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons',
    'https://libraries.io/api/',
    'https://cn.bing.com/*',
    'https://www.google.com/search*',
    '*://suggestqueries.google.com/complete/search/*',
    'chrome://favicon/',
    'https://fonts.googleapis.com/',
    'http://*/*',
    'https://*/*',
    'ws://localhost:9090/*',
    'http://localhost:3000/*',
    'https://localhost:3000/*',
    'ws://localhost:3000/*',
    '*://github.com/*',
    '*://api.github.com/*',
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
    },
    _execute_browser_action: {
      suggested_key: {
        "default": "Ctrl+E",
        "mac": "Ctrl+E"
      },
      description: 'Open snk popupsearch panel'
    }
  },
  background: {
    persistent: true,
    page: 'pages/background.html',
    // scripts: ['js/background.js']
  },
  devtools_page: 'pages/devtools.html',

  options_page: 'pages/options.html',
  content_scripts: [{
    // css: [],
    // js: [],
    run_at: 'document_end',
    // run_at: 'document_idle',
    matches: [
      // '<all_urls>',
      'https://github.com/*'
    ],
    all_frames: false
  }],
  default_locale: 'en',
  manifest_version: 2,
  content_security_policy: "default-src 'self'; script-src 'self' 'unsafe-eval' https://ssl.dev:3001 https://localhost:3000 http://localhost:3000 'unsafe-eval'; connect-src 'self' http://localhost:3000 ws://localhost:3000 ws://localhost:35729 ws://localhost:3000 ws://localhost:9090 http://cn.bing.com https://suggestqueries.google.com https://www.google.com https://www.bing.com; style-src * 'self' 'unsafe-inline'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' https://cn.bing.com data:; object-src 'self'",
  //content_security_policy: "script-src 'self' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; object-src 'self'",
  web_accessible_resources: [
    'panel.html',
    "icons/*.*",
    "img/*.*",
    "fonts/*.*",
    "css/*.*",
    'js/content.js'
  ]
}