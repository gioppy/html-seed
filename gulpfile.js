var gulp = require('gulp');
var sass = require('gulp-sass');
var cmq = require('gulp-combine-mq');
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');
var postcss = require('gulp-postcss');
var imageMin = require('gulp-imagemin');
var autoprefixer = require('autoprefixer');
var del = require('del');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var notify = require("gulp-notify");
var argv = require("yargs").argv;
var runSequece = require('run-sequence');
var watch = require('gulp-watch');
var path = require("path");

var opt = require("./config.json");

gulp.task('images', function(){
  return gulp.src(['assets/images/*', '!assets/images/*.md'])
    .pipe(imageMin())
    .pipe(gulp.dest((file) => {
      return file.base;
    }));
});

gulp.task('scripts', function(){
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
    })).on('error', notify.onError((e) => {
      var fullPath = e.fileName;
      var path = fullPath.replace(__dirname, '')
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

gulp.task('fonts', function(){
  return gulp.src('assets/fonts/fonts.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', notify.onError((e) => {
      return {
        title: `${e.relativePath}`,
        message: e.formatted,
        wait: true
      };
    })))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('assets/fonts'))
    .pipe(notify({
      title: opt.title,
      message: "Fonts Styles Processed",
      icon: path.join(__dirname, 'assets/images/icon.png')
    }));
});

gulp.task('sass', function(){
  return gulp.src(['assets/scss/*.scss', 'assets/scss/**/*.scss'])
    .pipe(sass({
      outputStyle: 'compact'
    }).on('error', notify.onError((e) => {
      return {
        title: `${e.relativePath}`,
        message: e.formatted,
        wait: true
      };
    })))
    .pipe(gulp.dest('assets/styles'))
    .pipe(notify({
      title: opt.title,
      message: "Styles Processed",
      icon: path.join(__dirname, 'assets/images/icon.png'),
      wait: false
    }));
});

gulp.task('styles', ['combine'], function(){
  return gulp.src('assets/styles/*.tmp.css')
    .pipe(cssmin({
      showLog:false
    }))
    .pipe(rename(function(path){
      var name = path.basename;
      path.basename = name.replace('.tmp', '.min');
    }))
    .pipe(postcss([ autoprefixer({ browsers: ['last 3 versions'] })]))
    .pipe(gulp.dest((file) => {
      return file.base;
    }));
});

gulp.task('combine', ['sass'], function() {
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

gulp.task('styleguide:styles', () => {
  return gulp.src(['assets/styles/*.css', '!assets/styles/*.min.css', '!assets/styles/*.tmp.css'])
    .pipe(gulp.dest('../patterns/source/css'));
});

gulp.task('styleguide:fonts', () => {
  return gulp.src(['assets/fonts/*', '!assets/fonts/*.scss', '!assets/fonts/*.md'])
    .pipe(gulp.dest('../patterns/source/fonts'));
});

gulp.task('styleguide:images', () => {
  return gulp.src(['assets/images/**/*', '!assets/images/*.md'])
    .pipe(gulp.dest('../patterns/source/images'));
});

gulp.task('watch', function(){
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
      'assets/scripts/*.js'
    ], function(){
      runSequece(
        ['styles', 'fonts', 'scripts'],
        'styles:remove:temp'
      );
    });
  }
});

gulp.task('default', (cb) => {
  if(argv.s){
      runSequece(
        ['styles', 'fonts', 'scripts'],
        'styles:remove:temp',
        'images',
        ['styleguide:styles', 'styleguide:fonts'],
        'styleguide:images',
        cb
      );
    }else{
      runSequece(
        ['styles', 'fonts', 'scripts'],
        'styles:remove:temp',
        'images',
        cb
      );
    }
})