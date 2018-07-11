#!/bin/sh

set -e 
set -x 

# find . -type f -name "*.js" -print
unuglifyjs background.js > background.nicify.js
unuglifyjs contentScript.js > contentScript.nicify.js
unuglifyjs js/githubContentScript.js > js/githubContentScript.nicify.js
unuglifyjs js/githubLeftNav.js > js/githubLeftNav.nicify.js
unuglifyjs js/settings.js > js/settings.nicify.js
unuglifyjs js/voblet.js > js/voblet.nicify.js

npm add react-dom
npm add react-tap-event-plugin
npm add jwt-decode
npm add lodash
npm add symbol-observable
npm add react-scripts
npm add admin-on-rest
npm add aor-graphql
# npm install --save-dev admin-on-rest
npm add aor-rich-text-input
npm i gulp gulp-react react reactify gulp-browserify gulp-concat es6-promise jwt-decode lodash  symbol-observable
