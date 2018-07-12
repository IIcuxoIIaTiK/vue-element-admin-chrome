var gulp= require('gulp');
var gulpBrowserify= require('gulp-browserify');
var browserify = require('browserify')
var babelify = require("babelify");
var uglify = require('gulp-uglify');
var minify = require('gulp-minify');
var gulpUtil = require('gulp-util');
//var streamify = require('gulp-streamify');
var concat= require('gulp-concat');
var react = require('gulp-react');
var es2015 = require('babel-preset-es2015');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');

//TODO: use uglify for prod

/* instrunctions to install
   npm install --global gulp
   npm install  gulp gulp-react react reactify gulp-browserify gulp-concat es6-promise react-router
*/

gulp.task('background-js', function() {
  var bundler = browserify('jscode/background.js').transform(babelify,  {presets: ["es2015", "react"]})
  return bundler.bundle()
  .on('error', function (err) { console.error(err); })
  .pipe(source('background.js'))
  .pipe(buffer())
  .pipe(gulp.dest('.'))
});

gulp.task('background-prod-js', function() {
  process.env.NODE_ENV = 'production';
  var bundler = browserify('jscode/background.js').transform(babelify,  {presets: ["es2015", "react"]})
  return bundler.bundle()
  .on('error', function (err) { console.error(err); })
  .pipe(source('background.js'))
  .pipe(buffer())
  .pipe(minify({ext:{min:'.js'},noSource:true,compress:{drop_console: true}}))
  .pipe(gulp.dest('.'))
});

gulp.task('voblet-js', function() {
    var bundler = browserify('jscode/voblet.js').transform(babelify,  {presets: ["es2015", "react"]})
    return bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('voblet.js'))
    .pipe(buffer())
    .pipe(gulp.dest('js'))
});

gulp.task('voblet-prod-js', function() {
    process.env.NODE_ENV = 'production';
    var bundler = browserify('jscode/voblet.js').transform(babelify,  {presets: ["es2015", "react"]})
    return bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('voblet.js'))
    .pipe(buffer())
    .pipe(minify({ext:{min:'.js'},noSource:true,compress:{drop_console: true}}))
    .pipe(gulp.dest('js'))
});


gulp.task('main-js', function() {
    var bundler = browserify('jscode/main.js').transform(babelify,  {presets: ["es2015", "react"]})
    return bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(gulp.dest('js'))
});

gulp.task('main-prod-js', function() {
    process.env.NODE_ENV = 'production';
    var bundler = browserify('jscode/main.js').transform(babelify,  {presets: ["es2015", "react"]})
    return bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(minify({ext:{min:'.js'},noSource:true,compress:{drop_console: true}}))
    .pipe(gulp.dest('js'))
});

gulp.task('githubLeftNav-js', function() {
    var bundler = browserify('jscode/githubLeftNav.js').transform(babelify,  {presets: ["es2015", "react"]})
    return bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('githubLeftNav.js'))
    .pipe(buffer())
    .pipe(gulp.dest('js'))
});

gulp.task('githubLeftNav-prod-js', function() {
    process.env.NODE_ENV = 'production';
    var bundler = browserify('jscode/githubLeftNav.js').transform(babelify,  {presets: ["es2015", "react"]})
    return bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('githubLeftNav.js'))
    .pipe(buffer())
    .pipe(minify({ext:{min:'.js'},noSource:true,compress:{drop_console: true}}))
    .pipe(gulp.dest('js'))
});

gulp.task('login-js', function() {
    var bundler = browserify('jscode/login.js').transform(babelify,  {presets: ["es2015", "react"]})
    return bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('login.js'))
    .pipe(buffer())
    .pipe(gulp.dest('js'))
});

gulp.task('login-prod-js', function() {
    process.env.NODE_ENV = 'production';
    var bundler = browserify('jscode/login.js').transform(babelify,  {presets: ["es2015", "react"]})
    return bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('login.js'))
    .pipe(buffer())
    .pipe(minify({ext:{min:'.js'},noSource:true,compress:{drop_console: true}}))
    .pipe(gulp.dest('js'))
});

gulp.task('contentScript-js', function() {
    var bundler = browserify('jscode/contentScript.js').transform(babelify,  {presets: ["es2015", "react"]})
    return bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('contentScript.js'))
    .pipe(buffer())
    .pipe(gulp.dest('.'))
});

gulp.task('contentScript-prod-js', function() {
    process.env.NODE_ENV = 'production';
    var bundler = browserify('jscode/contentScript.js').transform(babelify,  {presets: ["es2015", "react"]})
    return bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('contentScript.js'))
    .pipe(buffer())
    .pipe(minify({ext:{min:'.js'},noSource:true,compress:{drop_console: true}}))
    .pipe(gulp.dest('.'))
});


gulp.task('github-js', function() {
    var bundler = browserify('jscode/githubContentScript.js').transform(babelify,  {presets: ["es2015", "react"]})
    return bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('githubContentScript.js'))
    .pipe(buffer())
    .pipe(gulp.dest('js'))
});

gulp.task('github-prod-js', function() {
    process.env.NODE_ENV = 'production';
    var bundler = browserify('jscode/githubContentScript.js').transform(babelify,  {presets: ["es2015", "react"]})
    return bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('githubContentScript.js'))
    .pipe(buffer())
    .pipe(minify({ext:{min:'.js'},noSource:true,compress:{drop_console: true}}))
    .pipe(gulp.dest('js'))
});

gulp.task('settings-js', function() {
  var bundler = browserify('jscode/settings.js').transform(babelify,  {presets: ["es2015", "react"]})
  return bundler.bundle()
      .on('error', function (err) { console.error(err); })
      .pipe(source('settings.js'))
      .pipe(buffer())
      .pipe(gulp.dest('js'))
});

gulp.task('settings-prod-js', function() {
  process.env.NODE_ENV = 'production';
  var bundler = browserify('jscode/settings.js').transform(babelify,  {presets: ["es2015", "react"]})
  return bundler.bundle()
      .on('error', function (err) { console.error(err); })
      .pipe(source('settings.js'))
      .pipe(buffer())
      .pipe(minify({ext:{min:'.js'},noSource:true,compress:{drop_console: true}}))
      .pipe(gulp.dest('js'))
});


gulp.task('development',['background-js','login-js','main-js','githubLeftNav-js','contentScript-js','github-js','voblet-js','settings-js']);

//TODO: do a better job here buy variables etc https://knpuniversity.com/screencast/gulp/minify-only-production
gulp.task('production',['background-prod-js','login-prod-js','main-prod-js','githubLeftNav-prod-js','contentScript-prod-js','github-prod-js','voblet-prod-js','settings-prod-js']);


gulp.task('watch',function(){
  gulp.watch('jscode/*/*',['background-js','main-js','bookmarks-js']);
  gulp.watch('jscode/settings.js',['settings-js']);
  gulp.watch('jscode/*',['background-js','main-js','bookmarks-js']);
});

gulp.task('bookmarks-watch',function(){
  gulp.watch('jscode/*/*',['bookmarks-js']);
});

gulp.task('github-watch',['github-js'],function(){
  gulp.watch('jscode/*',['github-js']);
  gulp.watch('jscode/*/*',['github-js']);
});

gulp.task('githubLeftNav-watch',['githubLeftNav-js'],function(){
  gulp.watch('jscode/*',['githubLeftNav-js']);
  gulp.watch('jscode/*/*',['githubLeftNav-js']);
});

gulp.task('voblet-watch',function(){
  gulp.watch('jscode/*/*',['voblet-js']);
  gulp.watch('jscode/*',['voblet-js']);
});
