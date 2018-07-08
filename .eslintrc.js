// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  globals: {
     "chrome": true
    // chrome: true
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  // check if imports actually resolve
  'settings': {
    'import/resolver': {
      'webpack': {
        'config': 'build/webpack.base.js'
      }
    }
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    // no-useless-escape
    'no-useless-escape': 0,
    // spaced-comment
    'spaced-comment': 0,
    // no-new
    'no-new': 0,
    // no-control-regex
    'no-control-regex': 0,
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // 
    'space-before-function-paren': 1,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
