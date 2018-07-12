//TODO: use uglify for prod

/* instrunctions to install
   npm install --global gulp
   npm install  gulp gulp-vuejs vuex vuetify browserify gulp-browserify gulp-concat
*/

var gulp= require('gulp');
var gulpBrowserify= require('gulp-browserify');
var browserify = require('browserify')
var babelify = require("babelify");
var uglify = require('gulp-uglify');
var minify = require('gulp-minify');
var gulpUtil = require('gulp-util');
//var streamify = require('gulp-streamify');
var concat= require('gulp-concat');
var vue = require('gulp-vuejs');
// var es2015 = require('babel-preset-es2015');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('background-js', function() {
  var bundler = browserify('jscode/background.js').transform(babelify,  {presets: ["es2015", "react"]})
  return bundler.bundle()
  .on('error', function (err) { console.error(err); })
  .pipe(source('background.js'))
  .pipe(buffer())
  .pipe(gulp.dest('.'))
});

// gulp.task('development',['background-js','login-js','main-js','githubLeftNav-js','contentScript-js','github-js','voblet-js','settings-js']);
//TODO: do a better job here buy variables etc https://knpuniversity.com/screencast/gulp/minify-only-production
// gulp.task('production',['background-prod-js','login-prod-js','main-prod-js','githubLeftNav-prod-js','contentScript-prod-js','github-prod-js','voblet-prod-js','settings-prod-js']);

gulp.task('watch',function(){
  gulp.watch('src/*/*',['background-js','main-js','bookmarks-js']);
  gulp.watch('src/settings.js',['settings-js']);
  gulp.watch('src/*',['background-js','main-js','bookmarks-js']);
});

gulp.task('bookmarks-watch',function(){
  gulp.watch('src/*/*',['bookmarks-js']);
});

gulp.task('github-watch',['github-js'],function(){
  gulp.watch('src/*',['github-js']);
  gulp.watch('src/*/*',['github-js']);
});

gulp.task('sidebar-watch',['sidebar-js'],function(){
  gulp.watch('src/*',['sidebar-js']);
  gulp.watch('src/*/*',['sidebar-js']);
});