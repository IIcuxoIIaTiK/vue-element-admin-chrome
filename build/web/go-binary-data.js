/* Utilities allowing to compile a directory of files into an embeddable .go file */
export const generatorBinaryData = {
  gz_bindata: {
    executable: 'bindata',
    repo: 'https://github.com/kataras/bindata',
    install: ['go', 'get', '-u', 'github.com/kataras/bindata/cmd/bindata'],
    examples: [
      simple: ['bindata', '-o', 'data.go', './data/...'],
      advanced: ['bindata', '-ignore=\\.DS_Store', '-pkg', 'main', '-o', './backend/snk-goes/gz-bindata.go', './shared/dist/web/...'],
    ],
    force_install: true,
    tags: ['golang', 'iris', 'compress', 'performance', 'gzip', 'embeddable']
  },
  go_bindata: {
    executable: 'go-bindata',
    repo: 'https://github.com/shuLhan/go-bindata',
    install: ['go', 'get', '-u', 'github.com/shuLhan/go-bindata/...'],
    examples: [
      simple: ['go-bindata', '-o', 'data.go', './data/...'],
      advanced: ['go-bindata', '-ignore=\\.DS_Store', '-pkg', 'main', '-o', './backend/snk-goes/go-bindata.go', './shared/dist/web/...']
    ],
    force_install: true,
    tags: ['golang', 'embeddable', 'binary']
  },
  staticfiles: {
    executable: 'staticfiles',
    repo: 'https://github.com/kataras/bindata',
    install: ['go', 'get', '-u', 'github.com/bouk/staticfiles'],
    examples: [
      simple: ['staticfiles', '-o', 'data.go', './data/...'],
      advanced: ['staticfiles', '--package', 'main', '-o', './backend/snk-goes/go-bindata.go', './shared/dist/web']
    ],
    force_install: true,
    tags: ['golang', 'embeddable', 'binary', 'static']
  }
}
