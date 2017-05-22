/**
 * Created by joan on 29/04/17.
 */
const gulp            = require('gulp');
const gutil           = require('gulp-util');
const pump            = require('pump');
const commandLineArgs = require('command-line-args');
const clean           = require('gulp-clean');
const sourcemaps      = require('gulp-sourcemaps');
const buffer          = require('vinyl-buffer');
const runSequence     = require('run-sequence');
const babelify        = require('babelify');
const uglify          = require('gulp-uglify');
const changed         = require("gulp-changed");
const imagemin        = require('gulp-imagemin');
const Browserify      = require('browserify-gulp').default;
const browserSync     = require('browser-sync').create();

const optionDefinitions = [
    { name: 'type', alias: 't', defaultValue: "release" },
];
const options           = commandLineArgs(optionDefinitions, { partial: true });
const debug             = options["type"] === "debug";

gulp.task("js", function (done) {
    Browserify({
        entries: ["./public/pigs_book/js/pigs_book.js"],
        debug  : true
    }).configure(function () {
        this.bundler.transform(babelify, {
            // Use all of the ES2015 spec
            presets   : ["es2015"],
            compact   : true,
            sourceMaps: true
        });
    }).done(function (stream) {
        pump([
            stream,
            buffer(),
            sourcemaps.init({ loadMaps: true }),
            uglify(),
            sourcemaps.write("./"),
            gulp.dest("build/pigs_book/js"),
        ], done);
    });
});

gulp.task("html", function () {
    return pump([
        gulp.src('public/**/*.html'),
        changed("build"),
        gulp.dest('build')
    ]);
});

gulp.task("css", function () {
    return pump([
        gulp.src('public/**/*.css'),
        changed("build"),
        gulp.dest('build')
    ]);
});

gulp.task("fonts", function () {
    return pump([
        gulp.src('public/**/*.ttf'),
        changed("build"),
        gulp.dest('build')
    ]);
});

gulp.task("img", function () {
    return pump([
        gulp.src(['public/**/rendered/*.png', 'public/**/game/*.png']),
        changed("build"),
        imagemin({ verbose: true }),
        gulp.dest('build')
    ]);
});

gulp.task('browser-sync', ['watcher'], () => {
    return browserSync.init({
        proxy: "localhost/5book/pigs_book/pigs_book.html"
    })
});

gulp.task('watcher', ['all'], function () {
    gulp.watch('public/**/*.html').on('change', () => runSequence('html', browserSync.reload));
    gulp.watch('public/**/*.ttf').on('change', () => runSequence('fonts', browserSync.reload));
    gulp.watch('public/**/*.css').on('change', () => runSequence('css', browserSync.reload));
    gulp.watch('public/**/*.png').on('change', () => runSequence('img', browserSync.reload));
    gulp.watch('public/**/*.js').on('change', () => runSequence('js', browserSync.reload));
});

gulp.task('all', ['js', 'html', 'img', 'css', 'fonts']);

gulp.task('default', () => {
    gutil.log(gutil.colors.green(`Building in ${options["type"]} mode`));
    return runSequence('browser-sync');
});

gulp.task('rebuild', () => {
    return runSequence('clean', 'default');
});

gulp.task('clean', () => {
    return pump([
        gulp.src('build', { read: false }),
        clean()
    ]);
});

