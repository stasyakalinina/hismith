"use strict";

/* Path variables */

var path = {
  sourcePath: "./src",
  buildPath: "./build",
  scssPath: "/sass",
  cssPath: "/css",
  jsPath: "/js",
  jsModulesPath: "/modules",
  imgPath: "/img",
  svgPath: "/svg",
  fontsPath: "/fonts",
  blocksPath: "/blocks",
  utilityPath: "/utility",
  fontsPattern: "/**/*.{woff,woff2}",
  imgPattern: "/**/*.{jpg,jpeg,png,gif}",
  scssPattern: "/**/*.{scss,sass}",
  svgPattern: "/*.svg",
  htmlPattern: "/**/!(_)*.html",
  jsPattern: "/**/!(_)*.js"
};

/* Packages */

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var sourcemaps = require("gulp-sourcemaps");
var minify = require('gulp-csso');
var rename = require('gulp-rename');
var postcss = require('gulp-postcss');
var plumber = require('gulp-plumber');
var autoprefixer = require('autoprefixer');
var imagemin = require('gulp-imagemin');
var uglify = require("gulp-uglify");
var clean = require('del');

/* Tasks */

// Server
gulp.task("browser-sync", () => {
  browserSync.init({
    server: {
      baseDir: path.buildPath
    },
    notify: false,
    uf: false
  });

  browserSync.watch(path.sourcePath).on("change", reload);

});

// HTML
gulp.task('html', () => {
  return gulp.src(path.sourcePath + path.htmlPattern, { since: gulp.lastRun("html") })
    .pipe(plumber())
    .pipe(gulp.dest(path.buildPath))
    .pipe(reload({ stream: true }));
});

// SCSS to CSS
gulp.task("css", () => {
  return gulp.src(path.sourcePath + path.scssPath + path.scssPattern, { since: gulp.lastRun("css")})
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: "expanded"}).on("error", sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest(path.buildPath + path.cssPath))
    .pipe(minify())
    .pipe(rename({
      suffix: ".min",
      extname: ".css"
    }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(path.buildPath + path.cssPath))
    .pipe(reload({ stream: true }));
});

//gulp.task("css", gulp.series("sass-styles"));

// JavaScript
gulp.task("js", () => {
  return gulp.src(path.sourcePath + path.jsPath + path.jsModulesPath + path.jsPattern)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(gulp.dest(path.buildPath + path.jsPath + path.jsModulesPath))
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min",
      extname: ".js"
    }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(path.buildPath + path.jsPath + path.jsModulesPath))
    .pipe(reload({ stream: true }));
});

// JavaScript libs
gulp.task("libs-js", () => {
  return gulp.src(path.sourcePath + path.libsPath + path.jsPattern, { since: gulp.lastRun("libs-js") })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min",
      extname: ".js"
    }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(path.buildPath + path.jsPath + path.libsPath))
});

// Compress images
gulp.task("compress", () => {
  return gulp.src(path.sourcePath + path.imgPath + path.imgPattern, { since: gulp.lastRun("compress") })
    .pipe(imagemin([
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.svgo(),
      imagemin.optipng({
        optimizationLevel: 3
      })
    ]))
    .pipe(gulp.dest(path.buildPath + path.imgPath));
});

// Copy the rest to build path
gulp.task("copy", () => {
  return gulp.src([
    path.sourcePath + path.imgPath + path.svgPath + path.svgPattern,
    path.sourcePath + path.fontsPath + path.fontsPattern
  ], {
    base: path.sourcePath,
    since: gulp.lastRun("copy")
  })
    .pipe(gulp.dest(path.buildPath));
});

// Clean build
gulp.task("clean", () => {
  return clean(path.buildPath);
});

// Build
gulp.task("build", gulp.series("clean", "copy", "compress", "html", "css", "libs-js", "js"));

// Watch changes
gulp.task("watch", () => {
  gulp.watch(path.sourcePath + path.scssPath + path.scssPattern, gulp.series("css"));
  gulp.watch(path.sourcePath + path.jsPath + path.jsModulesPath + path.jsPattern, gulp.series("js"));
  gulp.watch(path.sourcePath + path.htmlPattern, gulp.series("html"));
});

// Build and watch
//gulp.task("build:watch", gulp.series("build", gulp.parallel("browser-sync", "watch")));

// Dev task - watch and browser-sync
gulp.task("dev", gulp.series("html", "css", "js", gulp.parallel("browser-sync", "watch")));
