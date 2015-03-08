'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var karma = require('karma').server;

gulp.task('default', ['serve']);

gulp.task('clean', function() {
    gulp.src('dist/*')
      .pipe(clean({force: true}));
});

gulp.task('minify-css', function() {
  var opts = {comments:true,spare:true};
  gulp.src(['app/collector.css', '!app/bower_components/**'])
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest('dist/'))
});

gulp.task('minify-js', function() {
  gulp.src(['app/collector.js','app/**/*.js', '!app/bower_components/**'])
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
  gulp.src('app/img*')
    .pipe(gulp.dest('dist/img'));
});

gulp.task('build',
  ['minify-css', 'minify-js', 'copy-html-files', 'copy-bower-components', 'copy-pictures']
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