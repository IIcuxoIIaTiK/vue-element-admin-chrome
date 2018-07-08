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
    'https://*.sniperkit.com/*',
    'http://github.com/',
    'https://github.com/'
  ],
  /*
  browser_action: {
    default_title: 'title',
    default_popup: 'pages/popup.html'
  },
  */
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
  // devtools_page: 'pages/devtools.html',
  // options_page: 'pages/options.html',
  content_scripts: [{
    js: [
      'js/manifest.js',
      'js/vendor.js',
      'js/0.0.js',
      'js/1.1.js',
      'js/2.2.js',
      'js/3.3.js',
      'js/4.4.js',
      // 'js/5.5.js',

      /*
      'js/6.6.js',
      'js/7.7.js',
      'js/8.8.js',
      'js/9.9.js',

      'js/10.10.js',
      'js/11.11.js',
      'js/12.12.js',
      'js/13.13.js',
      'js/14.14.js',
      'js/15.15.js',
      'js/16.16.js',
      'js/17.17.js',
      'js/18.18.js',
      'js/19.19.js',

      'js/20.20.js',
      'js/21.21.js',
      'js/22.22.js',
      'js/23.23.js',
      'js/24.24.js',
      'js/25.25.js',
      'js/26.26.js',
      'js/27.27.js',
      'js/28.28.js',
      'js/29.29.js',

      'js/30.30.js',
      'js/31.31.js',
      'js/32.32.js',
      'js/33.33.js',
      'js/34.34.js',
      'js/35.35.js',
      'js/36.36.js',
      'js/37.37.js',
      'js/38.38.js',
      'js/39.39.js',

      'js/40.40.js',
      'js/41.41.js',
      'js/42.42.js',
      'js/43.43.js',
      'js/44.44.js',
      'js/45.45.js',
      'js/46.46.js',

      'js/50.50.js',
      'js/51.51.js',
      'js/52.52.js',
      */

      'js/content.js'
    ],
    // run_at: 'document_end',
    run_at: 'document_idle',
    matches: [
      // '<all_urls>',
      'https://*.sniperkit.com/*',
      'https://github.com/*'
    ],
    all_frames: false
  }],
  default_locale: 'en',
  manifest_version: 2,
  content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",
  // content_security_policy: "script-src 'self' 'unsafe-eval'  https://fonts.googleapis.com https://code.jquery.com; object-src 'self'",
  web_accessible_resources: [
    // 'panel.html',
    'js/content.js'
  ]
}
