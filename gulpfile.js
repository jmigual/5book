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
var fs             = require('fs');

var destFolder = 'build/';
var destPublic = destFolder + 'public/';
var debug      = false;

var additionalFiles = [
    'public/css/w3.css',
    'public/css/custom.css'
];

function changedFile(name, options) {
    if (options === undefined) options = {};
    options.hasChanged = fileChanged;
    return changed(name, options);
}

function fileChanged(stream, callback, sourceFile, destPath) {    
    changed.compareLastModifiedTime(stream, callback, sourceFile, destPath);
    
    //console.log("File  : " + destPath);
    //console.log("Exists: " + fs.existsSync(destPath));
    if (!fs.existsSync(destPath)) {
        stream.push(sourceFile);
        gutil.log("Pushed " + gutil.colors.magenta(sourceFile.path.replace(__dirname + "/", "")));
    }
}

function getBowerFiles() {
    return mainBowerFiles({
        paths    : 'public',
        overrides: {
            'fullpage.js': {
                main: [
                    debug ? 'vendors/scrolloverflow.js' : 'vendors/scrolloverflow.min.js',
                    debug ? 'dist/jquery.fullpage.js' : 'dist/jquery.fullpage.min.js',
                    debug ? 'dist/jquery.fullpage.css' : 'dist/jquery.fullpage.min.css'
                ]
            }
        }
    });
}

gulp.task('css', function (cb) {
    var destCSS = destPublic + 'css';
    
    pump([
        gulp.src('public/css/*.css'),
        changedFile(destCSS),
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
        changedFile(destJs),
        uglify({
            preserveComments: 'license'
        }),
        gulp.dest(destJs)
    ], cb);
});

gulp.task('html', function (cb) {
    pump([
        gulp.src(['public/**/*.html', '!public/bower_components/**/*.html']),
        changedFile(destPublic),
        inject(gulp.src(getBowerFiles(), { read: false }),
            {
                name    : 'bower',
                relative: true
            }),
        inject(gulp.src(additionalFiles, { read: false }),
            {
                name    : 'additional',
                relative: true
            }),
        htmlmin({
            collapseWhitespace: true
        }),
        gulp.dest(destPublic)
    ], cb);
});

gulp.task('libraries', function (cb) {
    console.log(getBowerFiles());
    
    pump([
        gulp.src(getBowerFiles()),
        //gulp.dest(destLib)
        gulpCopy(destPublic, { prefix: 1 })
    ], cb);
});

gulp.task('images', function (cb) {
    var destImg = destPublic + 'img';
    
    pump([
        gulp.src('public/img/*'),
        changedFile(destImg),
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
    gutil.log(gutil.colors.green('Building in ' + (debug ? 'debug' : 'release') + ' mode'));
    gulp.start(['css', 'scripts', 'html', 'libraries', 'images']);
}); 
