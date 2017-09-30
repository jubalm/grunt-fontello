/*
 * grunt-fontello
 * https://github.com/jubal/grunt-fontello
 *
 * Copyright (c) 2013 Jubal Mabaquiao
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: { jshintrc: '.jshintrc' },
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ]
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['test/output']
    },

    // Configuration to be run (and then tested).
    fontello: {
      options: {
        config: 'test/fontello-config.json',
        fonts: 'test/output/fonts',
        styles: 'test/output/styles'
      },
      css: {
        options: { preprocessor: 'none' }
      },
      less: {
        options: { preprocessor: 'less' }
      },
      scss: {
        options: { preprocessor: 'scss' }
      },
      exclude: {
        options: {
          exclude: ['fontello-ie7.css', 'fontello.ttf'],
          fonts: 'test/output/fonts/exclude',
          styles: 'test/output/styles/exclude'
        }
      },
      cssFontPath: {
        options: {
          cssFontPath: 'foobar',
          styles: 'test/output/styles/cssFontPath'
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    },

    watch: {
      dist: {
        files: ['test/**/*.js', 'tasks/**/*.js', 'Gruntfile.js'],
        tasks: ['test']
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'fontello', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test', 'watch']);

};
