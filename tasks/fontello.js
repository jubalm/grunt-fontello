/*
 * grunt-fontello
 * https://github.com/jubal/grunt-fontello
 *
 * Copyright (c) 2013 Jubal Mabaquiao
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt){

  var fontello  = require('./lib/fontello'),
      async     = require('async');

  grunt.registerMultiTask('fontello', 'Download font library from fontello.com', function(){

    var
      done    = this.async(),
      options = this.options({
        host           : 'http://fontello.com',
        config         : 'config.json',
        fonts          : 'fonts',
        styles         : 'css',
        exclude        : [],
        zip            : false,
        preprocessor   : 'none',
        force          : true
      });

    var recipe = [
      fontello.deprecated.bind(null, options),
      fontello.init,
      fontello.check,
      fontello.post,
      fontello.fetch,
      fontello.fontPath
    ];

    async.waterfall(recipe, function(err, results){
      if(err) { grunt.log.error(err); }
      else {
        grunt.log.ok(results);
        done();
      }
    });

  });

};
