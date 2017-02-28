"use strict";
var gulp           = require('gulp');
var gutil          = require('gulp-util');
var pump           = require('pump');
var uglify         = require('gulp-uglify');
var csso           = require('gulp-csso');
var inject         = require('gulp-inject');
var mainBowerFiles = require('main-bower-files');
var clean          = require('gulp-clean');
var gulpCopy       = require('gulp-copy');
var changed        = require('gulp-changed');
var runSequence    = require('run-sequence');
var htmlmin        = require('gulp-htmlmin');
var argv           = require('yargs').argv;

var destFolder = 'build/';
var destPublic = destFolder + 'public/';
var debug      = false;

function fileChanged(stream, callback, sourceFile, destPath) {
    return changed.compareLastModifiedTime(stream, callback, sourceFile, destPath);
}

function getBowerFiles() {
    return mainBowerFiles({
        paths    : 'public',
        overrides: {
            'fullpage.js': {
                main: [
                    debug ? 'vendors/scrolloverflow.min.js' : 'vendors/scrolloverflow.js',
                    debug ? 'dist/jquery.fullpage.min.js' : 'dist/jquery.fullpage.js',
                    debug ? 'dist/jquery.fullpage.min.css' : 'dist/jquery.fullpage.css'
                ]
            }
        }
    });
}

gulp.task('css', function (cb) {
    var destCSS = destPublic + 'css';
    
    pump([
        gulp.src('public/css/*.css'),
        changed(destCSS),
        csso({
            restructure: !debug,
            sourceMap  : debug
        }),
        gulp.dest(destCSS)
    ], cb);
});

gulp.task('scripts', function (cb) {
    var destJs = destPublic + 'js';
    
    pump([
        gulp.src('public/js/*.js'),
        changed(destJs),
        uglify({
            preserveComments: 'license'
        }),
        gulp.dest(destJs)
    ], cb);
});

gulp.task('html', function (cb) {
    pump([
        gulp.src('public/*.html'),
        changed(destPublic, { hasChanged: fileChanged }),
        inject(gulp.src(getBowerFiles(), { read: false }),
            {
                name    : 'bower',
                relative: true
            }),
        htmlmin({
            collapseWhitespace: true
        }),
        gulp.dest(destPublic)
    ], cb);
});

gulp.task('libraries', function (cb) {
    var destLib = destPublic + 'bower_components';
    
    pump([
        gulp.src(getBowerFiles(), { read: false }),
        changed(destLib),
        gulpCopy(destLib, { prefix: 2 })
    ], cb);
});

gulp.task('images', function (cb) {
    var destImg = destPublic + 'img';
    
    pump([
        gulp.src('public/img/*', { read: false }),
        changed(destImg),
        gulp.dest(destImg)
    ], cb);
});

gulp.task('clean', function (cb) {
    pump([
        gulp.src(destFolder, { read: false }),
        clean()
    ], cb);
});

gulp.task('rebuild', function () {
    runSequence('clean', 'default');
});

gulp.task('default', function () {
    debug = argv.type === 'debug';
    gutil.log(gutil.colors.green('Running in ' + (debug ? 'debug' : 'release') + ' mode'));
    gulp.start(['css', 'scripts', 'html', 'libraries', 'images']);
});
