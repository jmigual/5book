/**
 * Created by joan on 29/04/17.
 */
const gulp            = require('gulp');
const gutil           = require('gulp-util');
const pump            = require('pump');
const commandLineArgs = require('command-line-args');
const babel           = require('gulp-babel');
const clean           = require('gulp-clean');
const tap             = require('gulp-tap');
const browserify      = require('browserify');
const through         = require('through2');
const sourcemaps      = require('gulp-sourcemaps');
const buffer          = require('vinyl-buffer');
const source          = require('vinyl-source-stream');
const globby          = require('globby');
const inject          = require('gulp-inject');
const rename          = require('gulp-rename');
const es              = require('event-stream');
const runSequence     = require('run-sequence');
const babelify        = require('babelify');
const domain          = require("domain");

const optionDefinitions = [
    { name: 'type', alias: 't', defaultValue: "release" },
];
const options           = commandLineArgs(optionDefinitions, { partial: true });
const debug             = options["type"] === "debug";

gulp.task('js', () => {    
    return pump(
        gulp.src("public/**/*.js"),
        tap(function (file) {
            let d = domain.create();
            
            d.on("error", err => {
                gutil.log(
                    gutil.colors.red("Browserify compile error:"),
                    err.message,
                    "\n\t",
                    gutil.colors.cyan("in file"),
                    file.path
                );
            });
            
            d.run(function () {
                file.contents = browserify({
                    entries      : [file.path],
                    debug        : true,
                    insertGlobals: true
                }).transform(babelify, {
                    // Use all of the ES2015 spec
                    presets   : ["es2015"],
                    sourceMaps: true
                }).bundle();
            });
        }),
        buffer(),
        sourcemaps.init({ loadMaps: true }),
        sourcemaps.write("./"),
        gulp.dest("build")
    );
});

gulp.task("html", function () {
    return pump([
        gulp.src('public/**/*.html'),
        gulp.dest('build')
    ])
});

gulp.task("img", function () {
    return pump([
        gulp.src('public/**/*.png'),
        gulp.dest('build')
    ])
});

gulp.task('clean', function () {
    return pump([
        gulp.src('build', { read: false }),
        clean()
    ]);
});

gulp.task('default', function (done) {
    gutil.log(gutil.colors.green(`Building in ${options["type"]} mode`));
    runSequence(['js', 'html', 'img'], done);
});

gulp.task('rebuild', function (done) {
    runSequence('clean', 'default', done);
});
