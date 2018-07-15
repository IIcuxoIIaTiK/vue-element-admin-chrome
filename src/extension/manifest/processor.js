// const { lstatSync, readdirSync, readFileSync } = require('fs')
// const { join, parse } = require('path')
const Module = require('module')

const path = require('path')
const fs = require('fs')
const debug = require('util')

const _get = require('lodash/get')
const glob = require('glob-fs')({ gitignore: true })
const pkg = require('../../../package.json');

const OUTPUT_DIR = path.join('..', '..', 'shared', 'dist', 'extension', 'chrome')

// module.exports =
exports.OptimizeManifest = (manifest = {}, options = {}) => {
// var OptimizeManifest = function () {
  const defaultContentScriptsJS = ['js/manifest.js', 'js/vendor.js', 'js/content.js']
  const buildDir = path.join('shared', 'dist', 'extension', 'chrome')
  const buildDirJS = path.join(buildDir, 'js')
  // var chunkJSfiles = glob.readdirSync(path.join(buildDirJS, '*.*.js'))

  var chunkJSfiles = {}
  glob.readdirSync(path.join(buildDirJS, '*.*.js'), function (err, files) {
    if (err) return console.error(err)
    console.log(files.length)
    var i;
    for (i = 0; i < files.length; i++) {
        console.log('file: ', files[i])
    }
    chunkJSfiles = files
  })

  const currentPath = process.cwd()

  manifest.content_scripts.js = ['js/manifest.js', 'js/vendor.js']
  manifest.content_scripts.js.push(chunkJSfiles)
  manifest.content_scripts.js.push('js/content.js')

  console.log('defaultContentScriptsJS: ', defaultContentScriptsJS)
  console.log('buildDir: ', buildDir)
  console.log('buildDirJS: ', buildDirJS)
  console.log('currentPath: ', currentPath)
  console.log('manifest.dev.js.files: ', debug.inspect(chunkJSfiles, {depth: 4, colors: true}))

  manifest.content_scripts.js  = defaultContentScriptsJS
  manifest.content_scripts.css = ['css/content.css']
  console.log('manifest.dev.obj: ', debug.inspect(manifest, {depth: 4, colors: true}))
  return manifest
}

/*
const analyzeFile = file =>
  new Promise((resolve, reject) => {
    fs.readFileSync(file, 'utf8', (err, data) => {
      if (err) {
        reject(err)
        return
      }
      console.log('data: ', JSON.stringify(data, null, 2))
    })
  })

const analyzeOutputFiles = (files) => {
  files.forEach(file => {
    analyzeFile(path.join(OUTPUT_DIR, file))
      .then(() => console.info(`File ${file}: OK`))
      .catch(console.error)
  })
}

// analyzeOutputFiles()
*/

/*
exports.FileWalker = function (dir, regExcludes, regIncludes, done) {
  var results = []

  fs.readdir(dir, function (err, list) {
    if (err) return done(err)

    var pending = list.length
    if (!pending) return done(null, results)

    list.forEach(function (file) {
      file = path.join(dir, file)

      var excluded = false
      var len = regExcludes.length
      var i = 0

      for (; i < len; i++) {
        if (file.match(regExcludes[i])) {
          excluded = true
        }
      }

      // Add if not in regExcludes
      if(excluded === false) {
        results.push(file)

        // Check if its a folder
        fs.stat(file, function (err, stat) {
          if (stat && stat.isDirectory()) {

            // If it is, walk again
            walk(file, regExcludes, function (err, res) {
              results = results.concat(res)

              if (!--pending) { done(null, results) }

            });
          } else {
            if (!--pending) { done(null, results) }
          }
        });
      } else {
        if (!--pending) { done(null, results) }
      }
    })
  })
}
*/

// exports.sortDependencies = module.exports = FileWalker
// var regExcludes = [/index\.html/, /js\/lib\.js/, /node_modules/];

/*
module.exports = buildEnv => (content) => {
  const manifest = JSON.parse(content.toString())
  const browser = _get(buildEnv, 'browser', 'chrome').toLowerCase()

  manifest.version = _get(buildEnv, 'version', pkg.version)
  manifest.permissions.push(process.env.ALLOW_ORIGIN)

  // Relax CSP for development to allow clearer source map
  if (process.env.NODE_ENV !== 'production') {
    manifest.content_security_policy = "script-src 'self' 'unsafe-eval'; object-src 'self'"
  }

  if (browser === 'firefox') {
    manifest.applications = {
      gecko: {
          strict_min_version: '53'
      }
    }
  }

  return Buffer.from(JSON.stringify(manifest, null, 4))
}
*/

/*
module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
})
*/
