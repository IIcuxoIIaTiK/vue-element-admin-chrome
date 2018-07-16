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
  /*
  // https://github.com/xabikos/vscode-javascript/issues/27
  autoFixOnSave: true,
  validate: [
    {
      language: 'vue',
      autoFix: true
    },
    {
      language: 'javascript',
      autoFix: true
    }
  ],
  */
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    // no-unused-vars
    'no-unused-vars': 0,
    // no-return-assign
    'no-return-assign': 0,
    // no-unneeded-ternary
    'no-unneeded-ternary': 0,
    // no-mixed-operators
    'no-mixed-operators': 0,
    // no-return-assign
    'no-return-assign': 0,
    // one-var
    'one-var': 0,
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
    // space-before-function-paren
    'space-before-function-paren': 1,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
