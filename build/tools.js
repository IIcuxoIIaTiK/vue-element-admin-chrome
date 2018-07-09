const { resolve } = require('path')
const { extract } = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// auto increaseVersion of manifest.json
exports.increaseVersion = (package) => {
  if (increaseVersion.versionUpdated) return
  increaseVersion.versionUpdated = true

  let version = package.version
  const max = 20
  const vs = version.split('.').map(i => +i)
  let len = vs.length
  while (len--) {
    if (++vs[len] < max) break
    vs[len] = 0
  }
  package.version = vs.join('.')
}

exports.htmlPage = (title, filename, chunks, template) => new HtmlWebpackPlugin({
  title,
  hash: true,
  cache: true,
  inject: 'body',
  filename: './pages/' + filename + '.html',
  template: template || resolve(__dirname, './page.ejs'),
  appMountId: 'app',
  chunks
})

exports.cssLoaders = (options = {}) => {

  let loaders = {}
  let prePprocessors = {
    css: {},
    postcss: {},
    less: { loader: 'less' },
    sass: { loader: 'sass', options: { indentedSyntax: true } },
    scss: { loader: 'sass' },
    stylus: { loader: 'stylus' },
    styl: { loader: 'stylus' }
  }

  for (let key in prePprocessors) {
    let loader = [{
      loader: 'css-loader',
      options: { minimize: process.env.NODE_ENV === 'production', sourceMap: options.sourceMap }
    }]

    if (prePprocessors[key].loader) {
      loader.push({
        loader: prePprocessors[key].loader + '-loader',
        options: Object.assign({}, prePprocessors[key].options, { sourceMap: options.sourceMap })
      })
    }

    if (options.extract) {
      loaders[key] = extract({ use: loader, fallback: 'vue-style-loader' })
    } else {
      loaders[key] = ['vue-style-loader'].concat(loader)
    }

  }
  return loaders
}

exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)
  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

const PageOptions = {
  title: '',
  hash: true,
  cache: true,
  inject: 'body',
  filename: 'pages/temp.html',
  template: resolve('./page.ejs'),
  appMountId: 'app',
  chunks: [],
}

exports.page = options => {
  const {
    title,
    name,
    chunks,
    template
  } = options
  return new HtmlWebpackPlugin(Object.assign({}, PAGE_OPTIONS, {
    title,
    chunks,
    template: template || PAGE_OPTIONS.template,
    filename: `pages/${name}.html`
  }))
}

exports.assetsPath = p => path.posix.join('assets', p)
