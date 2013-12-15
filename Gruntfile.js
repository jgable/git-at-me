'use strict';

module.exports = function (grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var cfg = {
        clean: {
            githubToken: ['github-token.js']
        },

        jshint2: {
            options: {
                jshintrc: '.jshintrc'
            },

            lib: ['index.js', 'Gruntfile.js', 'lib/**/*.js'],

            test: ['test/**/*.js']
        },

        mochacli: {
            options: {
                require: ['should'],
                reporter: 'spec',
                bail: true
            },

            all: ['test/*_spec.js']
        }
    };

    grunt.initConfig(cfg);

    grunt.registerTask('validate', ['clean', 'jshint2', 'mochacli']);

    grunt.registerTask('default', ['validate']);
};