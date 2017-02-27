"use strict";
var gulp = require('gulp');
var gutil = require('gulp-util');
var pump = require('pump');
var uglify = require('gulp-uglify');
var csso = require('gulp-csso');
var inject = require('gulp-inject');
var mainBowerFiles = require('main-bower-files');
var clean = require('gulp-clean');
var gulpCopy = require('gulp-copy');

var destFolder = 'build/';
var destPublic = destFolder + 'public/';
var debug = false;

var extraFiles = [__dirname + '/public/bower_components/fullpage.js/vendors/scrolloverflow.min.js'];

var bowerFiles = mainBowerFiles({
    paths: 'public'
});
var allBowerFiles = bowerFiles.concat(extraFiles);

gulp.task('css', function (cb) {
    pump([
        gulp.src('public/css/*.css'),
        csso({
            restructure: !debug,
            sourceMap: debug,
            debug: debug
        }),
        gulp.dest(destPublic + 'css')
    ], cb);
});

gulp.task('scripts', function(cb) {
    pump([
        gulp.src('public/js/*.js'),
        uglify({
            preserveComments: 'license'
        }),
        gulp.dest(destPublic + 'js')
    ], cb);
});

gulp.task('html', function(cb) {
    console.log(allBowerFiles);
    pump([
        gulp.src('public/*.html'),
        inject(gulp.src(allBowerFiles, { read: false }), 
            { 
                name: 'bower',
                relative: true
            }),
        gulp.dest(destPublic)
    ], cb);
});

gulp.task('libraries', function (cb) {
    pump([
        gulp.src(allBowerFiles),
        gulpCopy(destPublic + 'bower_components', { prefix: 2})
    ], cb);
});

gulp.task('default', ['css', 'scripts', 'html', 'libraries'], function () {
    debug = debug || false;
});

gulp.task('debug', function() {
    debug = true;
    gutil.log(gutil.colors.green('RUNNING IN DEBUG MODE'));
    gulp.start('default');
});
