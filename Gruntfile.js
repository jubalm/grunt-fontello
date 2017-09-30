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
      }
    },

    // Unit tests.
    nodeunit: {
      css: ['test/css_test.js'],
      less: ['test/less_test.js'],
      scss: ['test/scss_test.js']
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

  // Create seperate task lists for testing the different output methods of
  // this package. Always first clean the "output" dir, then run the respective
  // fontello task, then test the results
  grunt.registerTask('test:css', ['clean:tests', 'fontello:css', 'nodeunit:css']);
  grunt.registerTask('test:less', ['clean:tests', 'fontello:less', 'nodeunit:less']);
  grunt.registerTask('test:scss', ['clean:tests', 'fontello:scss', 'nodeunit:scss']);
  // Whenever the "test" task is run all different test scenarios.
  grunt.registerTask('test', ['test:css', 'test:less', 'test:scss']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test', 'watch']);

};
