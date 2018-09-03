'use strict';

var fs    = require('fs');
var grunt = require('grunt');

exports.fontello = {
  setUp: function(done) {
    this.extractPath = grunt.config.get('fontello.zip.options.zip');
    this.fontsPath = grunt.config.get('fontello.options.fonts');
    this.stylesPath = grunt.config.get('fontello.options.styles');
    done();
  },
  fonts: function(test) {
    test.ok(grunt.file.exists(this.fontsPath + '/fontello.eot'), '.eot font file missing');
    test.ok(grunt.file.exists(this.fontsPath + '/fontello.svg'), '.svg font file missing');
    test.ok(grunt.file.exists(this.fontsPath + '/fontello.ttf'), '.ttf font file missing');
    test.ok(grunt.file.exists(this.fontsPath + '/fontello.woff'), '.woff font file missing');
    test.ok(grunt.file.exists(this.fontsPath + '/fontello.woff2'), '.woff2 font file missing');
    test.done();
  },
  cssStylesheets: function(test) {
    test.ok(grunt.file.exists(this.stylesPath + '/animation.css'), 'Animations stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello.css'), 'Fontello stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello-codes.css'), 'Codes stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello-embedded.css'), 'Embedded stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello-ie7.css'), 'IE7 stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello-ie7-codes.css'), 'IE7 codes stylesheet missing');
    test.done();
  },
  lessStylesheets: function(test) {
    test.ok(grunt.file.exists(this.stylesPath + '/animation.less'), 'Animations stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello.less'), 'Fontello stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello-codes.less'), 'Codes stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello-embedded.less'), 'Embedded stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello-ie7.less'), 'IE7 stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello-ie7-codes.less'), 'IE7 codes stylesheet missing');
    test.done();
  },
  scssStylesheets: function(test) {
    test.ok(grunt.file.exists(this.stylesPath + '/_animation.scss'), 'Animations stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/_fontello.scss'), 'Fontello stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/_fontello-codes.scss'), 'Codes stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/_fontello-embedded.scss'), 'Embedded stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/_fontello-ie7.scss'), 'IE7 stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/_fontello-ie7-codes.scss'), 'IE7 codes stylesheet missing');
    test.done();
  },
  exclude: function(test) {
    test.ok(!grunt.file.exists(this.fonts + '/exclude/fontello.ttf'), '.ttf font file present while excluded');
    test.ok(!grunt.file.exists(this.stylesPath + '/exclude/fontello-ie7.css'), 'IE7 stylesheet present while excluded');
    test.ok(!grunt.file.exists(this.stylesPath + '/exclude/fontello-ie7-codes.css'), 'IE7 codes stylesheet present while excluded');
    test.done();
  },
  cssFontPath: function(test) {
    var stylesheet = fs.readFileSync(this.stylesPath + '/cssFontPath/fontello.css', { encoding: 'utf-8' });
    test.ok(/url\('foobar/.test(stylesheet), 'CSS font path not changed');
    test.done();
  },
  prefix: function(test) {
    test.ok(grunt.file.exists(this.stylesPath + '/prefix/foobar.css'), 'foobar stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/prefix/foobar-codes.css'), 'foobar codes stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/prefix/foobar-embedded.css'), 'foobar embedded stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/prefix/foobar-ie7.css'), 'foobar IE7 stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/prefix/foobar-ie7-codes.css'), 'foobar IE7 codes stylesheet missing');
    test.done();
  },
  zip: function(test) {
    test.ok(grunt.file.isDir(this.extractPath), 'Unzip extract path missing');
    test.done();
  }
};
