const gulp = require('gulp');
const sass = require('gulp-sass');
const cmq = require('gulp-combine-mq');
const rename = require('gulp-rename');
const cssmin = require('gulp-cssmin');
const postcss = require('gulp-postcss');
const imageMin = require('gulp-imagemin');
const autoprefixer = require('autoprefixer');
const del = require('del');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const notify = require("gulp-notify");
const argv = require("yargs").argv;
const runSequece = require('run-sequence');
const watch = require('gulp-watch');
const path = require("path");

const tsProject = ts.createProject("tsconfig.json");

const opt = require("./config.json");

gulp.task('images', () => {
  return gulp.src(['assets/images/*', '!assets/images/*.md'])
    .pipe(imageMin())
    .pipe(gulp.dest(function (file) {
      return file.base;
    }));
});

gulp.task('typescript', () => {
  return tsProject.src()
    .pipe(tsProject())
    .pipe(gulp.dest(function(file){
      return file.base;
    }));
});

gulp.task('scripts', ['typescript'], () => {
  return gulp.src(['assets/scripts/*.js', '!assets/scripts/*.min.js'])
    .pipe(uglify({
      mangle: true,
      compress: {
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true
      },
      preserveComments: function(){return false;}
    })).on('error', notify.onError(function(e) {
      const fullPath = e.fileName;
      const path = fullPath.replace(__dirname, '');
      return {
        title: path,
        message: e.message,
        wait: true
      };
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(function(file){
      return file.base;
    }));
});

gulp.task('fonts', () => {
  return gulp.src('assets/fonts/fonts.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', notify.onError(function(e) {
      return {
        title: e.relativePath,
        message: e.formatted,
        wait: true
      };
    })))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('assets/fonts'));
});

gulp.task('sass', () => {
  return gulp.src(['assets/scss/*.scss', 'assets/scss/**/*.scss'])
    .pipe(sass({
      outputStyle: 'compact'
    }).on('error', notify.onError(function(e) {
      return {
        title: e.relativePath,
        message: e.formatted,
        wait: true
      };
    })))
    .pipe(gulp.dest('assets/styles'));
});

gulp.task('styles', ['combine'], () => {
  return gulp.src('assets/styles/*.tmp.css')
    .pipe(cssmin({
      showLog:false
    }))
    .pipe(rename(function(path){
      let name = path.basename;
      path.basename = name.replace('.tmp', '.min');
    }))
    .pipe(postcss([ autoprefixer({ browsers: ['last 3 versions'] })]))
    .pipe(gulp.dest(function(file) {
      return file.base;
    }));
});

gulp.task('combine', ['sass'], () => {
  return gulp.src(['assets/styles/*.css', '!assets/styles/*.tmp.css', '!assets/styles/*.min.css'])
    .pipe(cmq({
      beautify: false
    }))
    .pipe(rename({suffix: '.tmp'}))
    .pipe(gulp.dest('assets/styles'));
});

gulp.task('styles:remove:temp', ['styles'], function(){
  del(['assets/styles/*.tmp.css']);
});

gulp.task('styleguide:styles', function() {
  return gulp.src(['assets/styles/*.css', '!assets/styles/*.min.css', '!assets/styles/*.tmp.css'])
    .pipe(gulp.dest('../patterns/source/css'));
});

gulp.task('styleguide:fonts', function() {
  return gulp.src(['assets/fonts/*', '!assets/fonts/*.scss', '!assets/fonts/*.md'])
    .pipe(gulp.dest('../patterns/source/fonts'));
});

gulp.task('styleguide:images', function() {
  return gulp.src(['assets/images/**/*', '!assets/images/*.md'])
    .pipe(gulp.dest('../patterns/source/images'));
});

gulp.task('watch', function() {
  if(argv.s){
    return watch([
      'assets/scss/*.scss',
      'assets/scss/**/*.scss',
      'assets/fonts/*.scss',
      'assets/images/**/*',
      '!assets/images/*.md'
    ], function(){
      runSequece(
        ['styleguide:styles', 'styleguide:fonts', 'styleguide:images'],
        'styles:remove:temp'
      );
    });
  }else{
    return watch([
      'assets/scss/*.scss',
      'assets/scss/**/*.scss',
      'assets/fonts/*.scss',
      //'assets/scripts/*.js',
      'assets/scripts/*.ts',
      'assets/images/**/*',
      '!assets/images/*.md'
    ], function(){
      runSequece(
        ['styles', 'fonts'],
        'scripts',
        'styles:remove:temp',
        'images'
      );
    });
  }
});

gulp.task('default', function(cb) {
  if(argv.s){
    runSequece(
      ['styles', 'fonts'],
      'styles:remove:temp',
      'images',
      ['styleguide:styles', 'styleguide:fonts'],
      'styleguide:images',
      cb
    );
  }else{
    runSequece(
      ['styles', 'fonts'],
      'scripts',
      'styles:remove:temp',
      'images',
      cb
    );
  }
});