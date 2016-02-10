'use strict'

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var stylish = require('jshint-stylish');
var sloc = require('gulp-sloc');
var gutil = require('gulp-util');
var assign = require('lodash.assign');
var uglify = require('gulp-uglify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var karma = require('karma').server;

var DIST_DIR = './dist/';

var customOpts = {
  entries: ['./app/js/tribetron.js'],
  extensions: ['.js'],
  transform: [babelify],
  paths: ['./node_modules','./app/js'],
  debug: true
};

var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

gulp.task('default', ['serve'])

gulp.task('clean', function() {
  return gulp.src(DIST_DIR)
    .pipe(clean({force: true}));
});

gulp.task('minify-css', function () {
	var opts = {comments:true,spare:true};
  return gulp.src('app/tribetron.sass')
    .pipe(sass())
	  .pipe(minifyCSS(opts))
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('copy-html-files', function () {
  return gulp.src('app/**/*.html')
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('copy-pictures', function() {
  return gulp.src('app/img/*.png')
    .pipe(gulp.dest(DIST_DIR + '/img'));
});

gulp.task('copy-json', function() {
  return gulp.src('app/res/*.json')
    .pipe(gulp.dest(DIST_DIR + '/res'));
});

gulp.task('copy-mp3', function() {
  return gulp.src('app/Tribetron.mp3')
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('copy-css', ['minify-css'], function() {
  return gulp.src(['node_modules/bootstrap/dist/css/bootstrap.css', 'node_modules/fontawesome/css/font-awesome.css', 'node_modules/animate.css/animate.min.css'])
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('copy-files', ['copy-html-files', 'copy-css', 'copy-pictures', 'copy-json', 'copy-mp3'])

gulp.task('bundle', ['copy-files'], function() {
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('refresh', ['bundle'], browserSync.reload);

gulp.task('watch', ['bundle'], function() {
    var watcher = gulp.watch('./app/**/*', ['refresh']);
    watcher.on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

gulp.task('serve', ['watch'], function() {
  return browserSync({ server: { baseDir: 'dist' } });
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('sloc', function() {
  gulp.src(['app/js/**/*.js']).pipe(sloc())
});

gulp.task('lint', function() {
  return gulp.src(['app/**/*.js'])
    .pipe(jshint({asi: true, globalstrict: true}))
    .pipe(jshint.reporter(stylish));
});

b.on('log', gutil.log); // output build logs to terminal
