'use strict';

const grunt = require('grunt');

let fontsPath = grunt.config.data.fontello.options.fonts;
let stylesPath = grunt.config.data.fontello.options.styles;

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
    test.ok(grunt.file.exists(this.stylesPath + '/animation.less'), 'Animations stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello.less'), 'Fontello stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello-codes.less'), 'Codes stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello-embedded.less'), 'Embedded stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello-ie7.less'), 'IE7 stylesheet missing');
    test.ok(grunt.file.exists(this.stylesPath + '/fontello-ie7-codes.less'), 'IE7 codes stylesheet missing');
    test.done();
  }
};
