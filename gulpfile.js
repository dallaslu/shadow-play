const gulp = require('gulp');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const filter = require('gulp-filter');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps')
const htmltidy = require('gulp-htmltidy');
const browserify = require('gulp-browserify');

const swig = require('gulp-swig');
const frontMatter = require('gulp-front-matter');
const htmlbeautify = require('gulp-html-beautify');
const uglify = require('gulp-uglify');
const babelify = require('babelify');
const brfs = require('brfs');

// sudo apt-get install libtool automake autoconf nasm make
// or:
// brew install libtool automake autoconf nasm make
// npm install --save-dev imagemin-jpegtran imagemin-svgo imagemin-gifsicle imagemin-optipng
//const imagemin = require('gulp-imagemin');
//const imageResize = require('gulp-image-resize');

const dele = require('delete');
const autoprefixer = require('gulp-autoprefixer');
const through = require("through2");
const path = require("path");

const browserSync = require('browser-sync').create();

// Project Path
const src = {
    root: 'src',
    docs: 'docs',
    scripts: 'src/**/*.js',
}

// Distribution Path
const dist = {
    root: 'dist',
    docs: 'dist/docs'
}

// package data
let pkg = require('./package.json');
// remove unnecessary properties
delete pkg.dependencies;
delete pkg.devDependencies;

function html() {
    return gulp.src('docs/**/*.html')
        // .pipe(frontMatter({ property: 'data.page', remove: true }))
        // .pipe(swig({
        //     setup: function(swig) { swig.setDefaults({ cache: false, loader: swig.loaders.fs(__dirname + '/docs') }); },
        //     default: {},
        //     data: {
        //         site: {
        //             title: 'Shadow Play',
        //             description: pkg.description,
        //             keywords: pkg.keywords,
        //             author: {
        //                 name: pkg.author
        //             }
        //         },
        //         pkg: pkg,
        //         __dirname: __dirname,
        //         global: {
        //             _dirname: __dirname
        //         }
        //     }
        // }))
        // .pipe(htmltidy({
        //     'doctype': 'html5',
        //     'wrap': 0,
        //     'indent': true,
        //     'vertical-space': false,
        //     'drop-empty-elements': false
        // }))
        .pipe(htmlbeautify({

        }))
        .pipe(gulp.dest(dist.root))
        .pipe(browserSync.stream({ once: true }));
}

function js() {
    return gulp.src(src.scripts)
        .pipe(sourcemaps.init({ loadMaps: true }))
        // .pipe(browserify({
        //     debug: true,
        //     transform: ["babelify", "brfs"]
        // }))
        // .pipe(uglify())
        .pipe(gulp.dest('dist/'))
        .pipe(terser())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('dist/'))
        .pipe(browserSync.stream({ once: true }));
}

function cleanDist(cb) {
    dele(dist.root, cb);
}

function watch() {
    browserSync.init({
        notify: false,
        port: 3000,
        server: {
            baseDir: "./dist",
            index: "/index.html"
        },
        watchOptions: {
            awaitWriteFinish: true
        }
    });

    gulp.watch('docs/**/*.html', html);
    gulp.watch(src.scripts, js);
}

exports.js = js;
exports.watch = watch;
exports.clean = cleanDist;
exports.build = gulp.series(gulp.parallel(html, js));
exports.package = gulp.series(cleanDist, gulp.parallel(html, js));
exports.default = gulp.series(gulp.parallel(html, js, watch));