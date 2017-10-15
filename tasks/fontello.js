/*
 * grunt-fontello
 * https://github.com/jubal/grunt-fontello
 *
 * Copyright (c) 2013 Jubal Mabaquiao
 * Licensed under the MIT license.
 */

'use strict';

var fontello = require('./lib/fontello');
var async    = require('async');

module.exports = function(grunt){

  grunt.registerMultiTask('fontello', 'Download font library from fontello.com', function(){

    var done    = this.async(),
        options = this.options({
          host         : 'http://fontello.com',
          config       : 'config.json',
          fonts        : 'fonts',
          styles       : 'css',
          exclude      : [],
          zip          : false,
          preprocessor : 'none',
          force        : true,
          cssFontPath  : undefined,
          prefix       : 'fontello'
        });

    var recipe = [
      fontello.deprecated.bind(null, options),
      fontello.init,
      fontello.check,
      fontello.post,
      fontello.fetch,
      fontello.fontPath
    ];

    async.waterfall(recipe, function(error, results){
      if(error) { grunt.log.error(error); }
      else {
        grunt.log.ok(results);
        done();
      }
    });

  });

};
