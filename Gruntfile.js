'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist',

      // Test dependencies (order is important):
      testDependencies: [
        // Common Dependencies
        '<%= yeoman.app %>/bower_components/jquery/dist/jquery.js',
        '<%= yeoman.app %>/bower_components/bootstrap/dist/js/bootstrap.js',
        // AngularJS Dependencies
        '<%= yeoman.app %>/bower_components/angular/angular.js',
        '<%= yeoman.app %>/bower_components/angular-mocks/angular-mocks.js',
        '<%= yeoman.app %>/bower_components/angular-resource/angular-resource.js',
        '<%= yeoman.app %>/bower_components/angular-cookies/angular-cookies.js',
        '<%= yeoman.app %>/bower_components/angular-sanitize/angular-sanitize.js',
        '<%= yeoman.app %>/bower_components/angular-route/angular-route.js',
        '<%= yeoman.app %>/bower_components/angular-animate/angular-animate.js',
        // AngularJS ThirdParty Libraries
        '<%= yeoman.app %>/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
        '<%= yeoman.app %>/bower_components/angular-loading-bar/src/loading-bar.js',
        '<%= yeoman.app %>/bower_components/angular-growl-v2/build/angular-growl.js',
        '<%= yeoman.app %>/bower_components/ip-address/dist/ip-address-globals.js',
        '<%= yeoman.app %>/bower_components/bootbox/bootbox.js'
      ]
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['bowerInstall']
      },
      js: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma:development']
      },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= yeoman.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        options: {
          force: true
        },
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    bowerInstall: {
      target: {
        src: [
          '<%= yeoman.app %>/index..html'
        ],
        cwd: '',
        dependencies: true,
        devDependencies: false,
        exclude: [],
        fileTypes: {},
        ignorePath: '',
        overrides: {}
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    cssmin: {
      options: {
        root: '<%= yeoman.app %>'
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', 'views/{,*/}*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'index.prod.html',
            'views/{,*/}*.html',
            'images/{,*/}*.{webp}',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*']
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles',
        'imagemin',
        'svgmin'
      ]
    },

    uglify: {
      options: {
        mangle: false,
        banner: '/*! <%= pkg.name %> <%= pkg.version %> - built on <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: [{
          src: '<%= yeoman.app %>/scripts/**/*.js',
          dest: '<%= yeoman.dist %>/<%= pkg.name %>.min.js'
        }]
      }
    },

    concat: {
       dist: {
        src: ['<%= yeoman.app %>/scripts/**/*.js'],
        dest: '<%= yeoman.dist %>/<%= pkg.name %>.js'
       }
    },

    // Test settings
    karma: {
      development: {
        configFile: 'karma.conf.js',
        options: {
          files: [
            '<%= yeoman.testDependencies %>',
            '<%= yeoman.app %>/scripts/**/*.js',
            'test/spec/**/*.js'
          ]
        }
      },
      dist: {
        configFile: 'karma.conf.js',
        options: {
          files: [
            '<%= yeoman.testDependencies %>',
            '<%= yeoman.dist %>/<%= pkg.name %>.js',
            'test/spec/**/*.js'
          ]
        }
      },
      minified: {
        configFile: 'karma.conf.js',
        options: {
          files: [
            '<%= yeoman.testDependencies %>',
            '<%= yeoman.dist %>/<%= pkg.name %>.min.js',
            'test/spec/**/*.js'
          ]
        }
      }
    },

    ngdocs: {
      options: {
        dest: 'docs',
        title: 'OpenNMS UI Requisitions Documentation',
        startPage: '/services/RequisitionsService'
      },

      models: {
        src: ['**/model/*.js'],
        title: 'Models'
      },

      controllers: {
        src: ['**/controllers/*.js'],
        title: 'Controllers'
      },

      services: {
        src: ['**/services/*.js'],
        title: 'Services'
      }
    }

  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'bowerInstall',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma:development'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'bowerInstall',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'karma:dist',
    'copy:dist',
    'uglify',
    'karma:minified',
    'rev',
    'htmlmin',
    'ngdocs'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);

};
