const gulp = require('gulp');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const filter = require('gulp-filter');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps')
const htmltidy = require('gulp-htmltidy');
const browserify = require('gulp-browserify');

const sass = require('gulp-sass');
const minifyCSS = require('gulp-csso');
const postcss = require('gulp-postcss');

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
    root: 'src/',
    docs: 'src/docs',
    docStyles: 'src/docs/assets/scss/**/*.scss',
    scripts: 'src/js/**/*.js',
}

// Distribution Path
const dist = {
    root: 'dist',
    docs: 'docs',
    docStyles: 'docs/assets/css'
}

// package data
let pkg = require('./package.json');
// remove unnecessary properties
delete pkg.dependencies;
delete pkg.devDependencies;

function html() {
    return gulp.src(src.docs + '/**/*.html')
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
        .pipe(gulp.dest(dist.docs))
        .pipe(browserSync.stream({ once: true }));
}

//compile scss into css
function css() {
    return gulp.src(src.docStyles)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsersList: [
                "last 2 versions",
                "ie >= 11"
            ]
        }))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest(dist.docStyles))
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(filter('**/*.css'))
        .pipe(minifyCSS())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest(dist.docStyles))
        .pipe(filter('**/*.css'))
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
        .pipe(gulp.dest('docs/'))
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
            baseDir: "./docs",
            index: "/index.html"
        },
        watchOptions: {
            awaitWriteFinish: true
        }
    });

    gulp.watch(src.docs + '/**/*.html', html);
    gulp.watch(src.docStyles, css);
    gulp.watch(src.scripts, js);
}

exports.html = html;
exports.js = js;
exports.css = css;
exports.watch = watch;
exports.clean = cleanDist;
exports.build = gulp.series(gulp.parallel(html, css, js));
exports.package = gulp.series(cleanDist, gulp.parallel(html, css, js));
exports.default = gulp.series(gulp.parallel(html, css, js, watch));