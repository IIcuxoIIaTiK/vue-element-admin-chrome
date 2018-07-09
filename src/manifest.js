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
    'nativeMessaging',
    'unlimitedStorage',
    'storage',
    'contextMenus',
    'cookies',
    'notifications',
    'tabCapture',
    'clipboardWrite',
    'clipboardRead',
    'http://github.com/',
    'https://github.com/'
  ],
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
      // 'js/5.5.js',
      // 'js/inject.js',
      'js/content.js'
    ],
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
  // content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",
  content_security_policy: "script-src 'self' 'unsafe-eval' https://fonts.googleapis.com https://code.jquery.com; object-src 'self'",
  web_accessible_resources: [
    'panel.html',
    "icons/*.*",
    "img/*.*",
    "fonts/*.*",
    "css/*.*",
    'js/content.js'
  ]
}
