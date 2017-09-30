'use strict';

const grunt = require('grunt');

exports.fontello = {
  setUp: function(done) {
    this.fontsPath = grunt.config.get('fontello.options.fonts');
    this.stylesPath = grunt.config.get('fontello.options.styles');
    done();
  },

  'Outputs fonts': function(test) {
    test.ok(grunt.file.exists(this.fontsPath + '/fontello.eot'), '.eot font file missing');
    test.ok(grunt.file.exists(this.fontsPath + '/fontello.svg'), '.svg font file missing');
    test.ok(grunt.file.exists(this.fontsPath + '/fontello.ttf'), '.ttf font file missing');
    test.ok(grunt.file.exists(this.fontsPath + '/fontello.woff'), '.woff font file missing');
    test.ok(grunt.file.exists(this.fontsPath + '/fontello.woff2'), '.woff2 font file missing');
    test.done();
  },

  'Outputs stylesheets': function(test) {
    test.ok(grunt.file.exists(this.stylesPath + '/_animation.scss'), 'Animations stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/_fontello.scss'), 'Fontello stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/_fontello-codes.scss'), 'Codes stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/_fontello-embedded.scss'), 'Embedded stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/_fontello-ie7.scss'), 'IE7 stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/_fontello-ie7-codes.scss'), 'IE7 codes stylesheet missing');
    test.done();
  }
};
