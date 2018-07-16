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
    'https://libraries.io/api/',
    'http://localhost:3000/api/',
    'https://localhost:3000/api/',
    'chrome://favicon/',
    'http://*/*',
    'https://*/*',
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
  content_security_policy: "script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; object-src 'self'",
  web_accessible_resources: [
    'panel.html',
    "icons/*.*",
    "img/*.*",
    "fonts/*.*",
    "css/*.*",
    'js/content.js'
  ]
}