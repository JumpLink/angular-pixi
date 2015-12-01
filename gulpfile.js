var gulp = require('gulp');                             // https://github.com/gulpjs/gulp
var plumber = require('gulp-plumber');                  // https://github.com/floatdrop/gulp-plumber
var jade = require('gulp-jade');                        // https://github.com/phated/gulp-jade
var concat = require('gulp-concat');                    // https://github.com/contra/gulp-concat
var jshint = require ('gulp-jshint');                   // https://github.com/spalger/gulp-jshint
var uglify = require ('gulp-uglify');                   // https://github.com/terinjokes/gulp-uglify
var ngAnnotate = require('gulp-ng-annotate');           // https://github.com/Kagami/gulp-ng-annotate
var debug = require('gulp-debug');                      // https://github.com/sindresorhus/gulp-debug
var sourcemaps = require('gulp-sourcemaps');            // https://github.com/floridoo/gulp-sourcemaps
var sass = require('gulp-sass');                        // https://github.com/dlmanning/gulp-sass
var autoprefixer = require('gulp-autoprefixer');        // https://github.com/sindresorhus/gulp-autoprefixer
var browserSync = require('browser-sync');              // http://www.browsersync.io/docs/gulp/
var reload = browserSync.reload;                        // Reloads synced browser on changes

var SOURCES = {
  LIBS: [
    //- PIXI
    './src/third-party/pixi.js/bin/pixi.js',
    //- angular
    './src/third-party/angular/angular.js',
    //'./src/third-party/angular-i18n/angular-locale_de.js',
  ],
  TEMPLATES: [
    './src/templates/**/*.jade',
  ],
  APP: [
    './src/scripts/app.js',
    './src/scripts/config/*.js',
    './src/scripts/services/*.js',
    './src/scripts/controllers/*.js',
    './src/scripts/directives/*.js',
    './src/scripts/modules/*.js',
  ],
  STYLES: [
    './src/styles/libs.scss',
    './src/styles/app.scss',
  ]
};

var WATCHES = {
  LIBS: SOURCES.LIBS,
  TEMPLATES: SOURCES.TEMPLATES,
  APP: SOURCES.APP,
  STYLES: './src/styles/**/*.scss'
};

var DESTS = {
  LIBS: './dest/scripts/',
  TEMPLATES: './dest/templates/',
  APP: './dest/scripts/',
  STYLES: './dest/styles/'
};

function showError(error) {
  gutil.log(error.toString());
  this.emit('end');
}

/**
 * Seperate watches to work with browser sync,
 * This wasn't possible with gulp-watch, just sass was working with gulp-watch
 * @see https://github.com/BrowserSync/recipes/tree/master/recipes/gulp.jade
 */
gulp.task('jade-watch', ['templates']);
gulp.task('app-watch', ['app']);
gulp.task('libs-watch', ['libs']);

/**
 * The default gulp task
 */
gulp.task('default', ['serve'], function () {

});

/**
 * The build lib gulp task
 */
gulp.task('build', ['styles', 'libs', 'app'], function () {

});

gulp.task('templates', function() {
  var locals = {};
  return gulp.src(SOURCES.TEMPLATES)
    .pipe(plumber(showError))
    .pipe(jade({locals: locals}).on('error', console.log))
    .pipe(debug({title: 'templates:'}))
    .pipe(gulp.dest(DESTS.TEMPLATES));
});

gulp.task('libs', function() {
  return gulp.src(SOURCES.LIBS)
    .pipe(plumber(showError))
    .pipe(sourcemaps.init())
    .pipe(ngAnnotate())
    // .pipe(jshint())
    // .pipe(jshint.reporter('default')) 
    .pipe(concat('libs.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('/'))
    .pipe(debug({title: 'libs:'}))
    .pipe(gulp.dest(DESTS.LIBS));
});

gulp.task('app', function() {
  return gulp.src(SOURCES.APP)
    .pipe(plumber(showError))
    .pipe(jshint())
    .pipe(jshint.reporter('default')) 
    .pipe(sourcemaps.init())
    .pipe(ngAnnotate())
    .pipe(concat('app.js'))
    .pipe(uglify({mangle: false})) // use mangle because uglify destroys my anglar files if not set
    .pipe(sourcemaps.write('/'))
    .pipe(debug({title: 'app:'}))
    .pipe(gulp.dest(DESTS.APP));
});

gulp.task('styles', function () {
  return gulp.src(SOURCES.STYLES)
    .pipe(plumber(showError))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions', '> 1%']
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(debug({title: 'styles:'}))
    .pipe(gulp.dest(DESTS.STYLES))
    .pipe(reload({stream: true}));
});

// ===================== EXAMPLES =====================

var EXAMPLES_SOURCES = {
  TEMPLATES: [
    './src/examples/**/*.jade',
  ],
  LIBS: [
    './dest/scripts/app.js',
    './dest/scripts/libs.js',
  ],
  APP: [
    './src/examples/**/*.js',
  ],
  STYLES: [
    './src/examples/**/*.scss',
  ]
};

var EXAMPLES_DESTS = {
  TEMPLATES: './dest/examples/',
  LIBS: './dest/examples/',
  APP: './dest/examples/',
  STYLES: './dest/examples/'
};

var EXAMPLES_WATCHES = {
  LIBS: EXAMPLES_SOURCES.LIBS,
  TEMPLATES: EXAMPLES_SOURCES.TEMPLATES,
  APP: EXAMPLES_SOURCES.APP,
  STYLES: EXAMPLES_SOURCES.STYLES,
};

gulp.task('examples', ['build', 'examples:styles', 'examples:templates', 'examples:app'], function () {

});

gulp.task('examples:jade-watch', ['examples:templates']);
gulp.task('examples:app-watch', ['examples:app']);
gulp.task('examples:libs-watch', ['build']);

gulp.task('examples:watch', ['build', 'examples:templates', 'examples:styles', 'examples:app', 'watch'], function () {
  gulp.watch(EXAMPLES_WATCHES.STYLES, ['examples:styles']);
  gulp.watch(EXAMPLES_WATCHES.APP, ['examples:app-watch']);
  gulp.watch(EXAMPLES_WATCHES.LIBS, ['examples:libs-watch']);
  gulp.watch(EXAMPLES_WATCHES.TEMPLATES, ['examples:jade-watch']);
});

gulp.task('examples:templates', function() {
  var locals = {};
  return gulp.src(EXAMPLES_SOURCES.TEMPLATES)
    .pipe(plumber(showError))
    .pipe(jade({locals: locals}).on('error', console.log))
    .pipe(debug({title: 'templates:'}))
    .pipe(gulp.dest(EXAMPLES_DESTS.TEMPLATES));
});

gulp.task('examples:app', function() {
  return gulp.src(EXAMPLES_SOURCES.APP)
    .pipe(plumber(showError))
    .pipe(jshint())
    .pipe(jshint.reporter('default')) 
    .pipe(sourcemaps.init())
    .pipe(ngAnnotate())
    .pipe(uglify({mangle: false})) // use mangle because uglify destroys my anglar files if not set
    .pipe(sourcemaps.write('/'))
    .pipe(debug({title: 'app:'}))
    .pipe(gulp.dest(EXAMPLES_DESTS.APP));
});

gulp.task('examples:styles', function () {
  return gulp.src(EXAMPLES_SOURCES.STYLES)
    .pipe(plumber(showError))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions', '> 1%']
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(debug({title: 'styles:'}))
    .pipe(gulp.dest(EXAMPLES_DESTS.STYLES))
    .pipe(reload({stream: true}));
});

/**
 * DEPRECATED
 * Start browsersync and setup watcher
 */
gulp.task('serve', ['build', 'examples'], function () {
  browserSync.init({
    server: "./",
    logLevel: 'info',
    logConnections: true,
    open: false,
  });
  gulp.watch(WATCHES.STYLES, ['styles']);
  gulp.watch(WATCHES.APP, ['app-watch']);
  gulp.watch(WATCHES.LIBS, ['libs-watch']);
  gulp.watch(WATCHES.TEMPLATES, ['jade-watch']);
  gulp.watch(EXAMPLES_WATCHES.STYLES, ['examples:styles']);
  gulp.watch(EXAMPLES_WATCHES.APP, ['examples:app-watch']);
  gulp.watch(EXAMPLES_WATCHES.LIBS, ['examples:libs-watch']);
  gulp.watch(EXAMPLES_WATCHES.TEMPLATES, ['examples:jade-watch']);
});