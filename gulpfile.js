'use strict'

var gulp = require('gulp')
var uglify = require('gulp-uglify')
var minifyCSS = require('gulp-minify-css')
var clean = require('gulp-clean')
var jshint = require('gulp-jshint')
var stylish = require('jshint-stylish');

var browserSync = require('browser-sync')
var reload = browserSync.reload

var karma = require('karma').server

gulp.task('default', ['serve'])

gulp.task('clean', function() {
    gulp.src('dist/*')
      .pipe(clean({force: true}))
});

gulp.task('lint', function() {
  return gulp.src(['app/**/*.js', '!app/bower_components/**'])
    .pipe(jshint({asi: true, globalstrict: true}))
    .pipe(jshint.reporter(stylish));
});

gulp.task('minify-css', function() {
  var opts = {comments:true,spare:true};
  gulp.src(['app/tribetron.css', '!app/bower_components/**'])
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest('dist/'))
});

gulp.task('minify-js', function() {
  gulp.src(['app/**/*.js', '!app/bower_components/**'])
    .pipe(uglify({}))
    .pipe(gulp.dest('dist/'))
});

gulp.task('copy-bower-components', function () {
  gulp.src('app/bower_components/**')
    .pipe(gulp.dest('dist/bower_components'));
});

gulp.task('copy-html-files', function () {
  gulp.src('app/**/*.html')
    .pipe(gulp.dest('dist/'));
});

gulp.task('copy-pictures', function() {
  gulp.src('app/img/*.png')
    .pipe(gulp.dest('dist/img'));
});

gulp.task('copy-json', function() {
  gulp.src('app/res/*.json')
    .pipe(gulp.dest('dist/res'));
});

gulp.task('copy-mp3', function() {
  gulp.src('app/Tribetron.mp3')
    .pipe(gulp.dest('dist/'));
});

gulp.task('build',
  ['minify-css', 'minify-js', 'copy-html-files', 'copy-bower-components', 'copy-pictures', 'copy-json', 'copy-mp3']
);

gulp.task('build-start', ['build', 'serveDist']);

gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: 'app'
    }
  });

  gulp.watch(['*.html', 'styles/**/*.css', 'scripts/**/*.js'], {cwd: 'app'}, reload);
});

gulp.task('serveDist', function() {
  browserSync({
	server: {
	  baseDir: 'dist'
	}
  });
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});