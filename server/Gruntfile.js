/**
 * Using Grunt to automate minification and compilation process
 */
module.exports = function(grunt) {
    'use strict';
    var bower = 'public/bower_components/';

    // Create the project object for easier editing
    grunt.initConfig({
        // Read the package file
        pkg: grunt.file.readJSON('package.json'),

        // Settings for the project paths
        project: {
            assets: 'public',
            css: '<%= project.assets %>/css',
            scss: '<%= project.assets %>/scss',
            js: '<%= project.assets %>/js'
        },

        /**
         * Banner to be added to all Javascript and CSS
         * files with the option set to display the banner
         */
        tag : {
            banner: '/*!\n' +
            ' * <%= pkg.name %>\n' +
            ' * @author <%= pkg.author %>\n' +
            ' * @version <%= pkg.version %>\n' +
            ' * Copyright <%= pkg.copyright %>. <%= pkg.license %> licensed.\n' +
            ' */\n'
        },

        /**
         * SASS compiler will be on the watcher and will look
         * for changes in project *.scss files. It will then
         * move them into the css folder for the distribution
         */
        sass: {
            dist: {
                options: {
                    banner: '<%= tag.banner %>'
                },
                files: {
                    '<%= project.css %>/main.css' : '<%= project.scss %>/main.scss'
                }
            }
        },

        /**
         * Linting task, should be run before uglify
         */
        eslint: {
            web: {
                options: {
                    configFile: process.env['HOME']+'/.eslintrc',
                    quiet: true
                },
                src: [
                    '<%= project.js %>/**/*.js',
                    '!<%= project.js %>/buildenv.js',
                    '!<%= project.js %>/min/*.min.js',
                    '!<%= project.js %>/min/**/*'
                ]
            },
            server: {
                options: {
                    configFile: process.env['HOME']+'/.eslintrc',
                    quiet: true
                },
                src: [
                    'lib/**/*.js',
                ]
            },
            full: {
                options: {
                    configFile: process.env['HOME']+'/.eslintrc',
                    quiet: false
                },
                src: [
                    '<%= project.js %>/**/*.js',
                    '!<%= project.js %>/buildenv.js',
                    '!<%= project.js %>/min/*.min.js',
                    '!<%= project.js %>/min/**/*',
                    'lib/**/*.js'
                ]
            }
        },

        /**
         * Javascript uglification and compilation
         */
        uglify: {
            options: {
                banner: '<%= tag.banner %>',
                // Set to true for full production environment
                mangle: false,
                // Set to true if you want to debug the JS
                beautify: false,
                // Enable source maps
                sourceMap: true
            },
            dist: {
                // To minify any further files, add them to this in the format:
                files: {
                    '<%= project.js %>/min/app.min.js': ['<%= project.js %>/app.js'],
                    '<%= project.js %>/min/controllers.min.js': ['<%= project.js %>/controllers/*.js'],
                    '<%= project.js %>/min/directives.min.js': ['<%= project.js %>/directives/*.js'],
                    '<%= project.js %>/min/services.min.js': ['<%= project.js %>/services/*.js']
                }
            }
        },

        // Concatenate all of the libraries
        concat: {
            libs: {
                // Add all required files from bower_components here, the order
                // that they are written in will be compilation order
                files: {
                    '<%= project.js %>/min/lib.min.js': [
                        bower + 'angular/angular.min.js',
                        bower + 'angular-route/angular-route.min.js',
                        bower + 'angular-http-loader/app/package/js/angular-http-loader.min.js',
                        bower + 'angular-modal-service/dst/angular-modal-service.min.js',
                        bower + 'angular-json-pretty/dist/angular-json-pretty.js',
                        bower + 'at-table/dist/angular-table.js',
                        bower + 'jquery/jquery.min.js',
                        bower + 'jQuery-One-Page-Nav/jquery.nav.js',
                        bower + 'Chart.js/Chart.min.js',
                        bower + 'angular-chart.js/dist/angular-chart.min.js',
                        bower + 'angular-sanitize/angular-sanitize.min.js',
                        bower + 'ng-notifications-bar/dist/ngNotificationsBar.min.js',
                        bower + 'ngmap/build/scripts/ng-map.min.js',
                        bower + 'sweetalert/dist/sweetalert.min.js',
                        bower + 'better-dom/dist/better-dom.js',
                        bower + 'better-i18n-plugin/dist/better-i18n-plugin.js',
                        bower + 'better-dateinput-polyfill/dist/better-dateinput-polyfill.js'
                    ]
                }
            }
        },

        /**
         * Task to run both the standard watch and nodemon task together
         */
        concurrent: {
            dev: {
                options: {
                    logConcurrentOutput: true
                },
                tasks: ['watch', 'nodemon:dev']
            }
        },

        /**
         * Grunt wrapper for nodemon
         */
        nodemon: {
            dev: {
                options: {
                    file: 'app.js',
                    watch: ['lib']
                }
            }
        },

        /**
         * This watch task will keep Grunt idle until one of the files
         * in the file array for each task is modified, and then it will
         * run the tasks from the task array
         */
        watch: {
            sass: {
                files: '<%= project.scss %>/**/*',
                tasks: ['sass:dist']
            },
            js: {
                files: ['<%= project.js %>/**/*', '!<%= project.js %>/min/**/*'],
                tasks: ['uglify:dist']
            },
            html: {
                files: ['<%= project.assets %>/index-dev.html'],
                tasks: ['useminPrepare', 'usemin']
            }
        }
    });

    /**
     * Load Grunt plugins
     */
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    /**
     * Default task
     */
    grunt.registerTask('start', [
        'sass:dist',
        'concat:libs',
        'uglify:dist',
        'concurrent:dev'
    ]);

    /**
     * Watch only web files
     */
    grunt.registerTask('web', [
        'sass:dist',
        'concat:libs',
        'uglify:dist',
        'watch'
    ]);

    /**
     * Build task, concat everything into dist folder
     */
    grunt.registerTask('build', [
        'sass:dist',
        'concat:libs',
        'uglify:dist'
    ]);

    /**
     * Linting task - run the full version of the linter
     */
    grunt.registerTask('lint', [
        'eslint:full'
    ]);
};
