var gulp = require('gulp');
var sass = require('gulp-sass');
var cmq = require('gulp-combine-mq');
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var notify = require("gulp-notify");
var argv = require("yargs").argv;
var path = require("path");

var opt = require("./config.json");

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
    .pipe(gulp.dest('assets/scripts'))
    .pipe(notify({
      title: opt.title,
      message: "Scripts Processed",
      icon: path.join(__dirname, 'assets/images/icon.png')
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
    .pipe(gulp.dest('assets/styles'));
});

gulp.task('combine', ['sass'], function() {
  return gulp.src(['assets/styles/*.css', '!assets/styles/*.tmp.css', '!assets/styles/*.min.css'])
    .pipe(cmq({
      beautify: false
    }))
    .pipe(rename({suffix: '.tmp'}))
    .pipe(gulp.dest('assets/styles'));
});

gulp.task('styleguide:styles', () => {
  return gulp.src(['assets/styles/*.css', '!assets/styles/*.min.css', '!assets/styles/*.tmp.css'])
    .pipe(gulp.dest('../patterns/source/css'));
});

gulp.task('styleguide:fonts', () => {
  return gulp.src(['assets/fonts/*', '!assets/fonts/*.scss'])
    .pipe(gulp.dest('../patterns/source/fonts'));
});

gulp.task('watch', function(){
  gulp.watch(['assets/scss/*.scss', 'assets/scss/**/*.scss'], ['styles']);
  gulp.watch(['assets/fonts/*.scss'], ['fonts']);
  gulp.watch(['assets/scripts/*.js', '!assets/scripts/*.min.js'], ['scripts']);
  if(argv.s){
    gulp.watch(['assets/styles/*.css', '!assets/styles/*.min.css', '!assets/styles/*.tmp.css'], ['styleguide:styles']);
    gulp.watch(['assets/fonts/*', '!assets/fonts/*.scss'], ['styleguide:fonts']);
  }
});