module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      build: ['Gruntfile.js', 'src/**/*.js']
    },
    watch: {
      scripts: {
        files: 'src/**/*.js',
        tasks: ['jshint', 'uglify:dev']
      },
      styles: {
        files: 'src/**/*.css',
        tasks: ['cssmin']
      },
      html: {
        files: 'src/**/*.html',
        tasks: ['htmlmin']
      },
      python: {
        files: 'src/**/*.py',
        tasks: ['copy:python']
      }
    },
    copy: {
      build: {
        files: [
          {
            expand: true,
            src: 'node_modules/knockout/build/output/knockout-latest.js',
            dest: 'dist/js/',
            flatten: true,
            rename: function (dest, src) {
              return dest + 'knockout.js';
            }
          }
        ]
      },
      python: {
        files: [
          {
            expand: true,
            flatten: true,
            src: 'src/**/*.py',
            dest: 'dist/'
          }
        ]
      },
      fonts: {
        files: [
          {
            expand: true,
            flatten: true,
            src: 'src/fonts/*',
            dest: 'dist/fonts/'
          }
        ]
      }
    },
    htmlmin: {
      build: {
        options: {
          removeComments: false,
          collapseWhitespace: true
        },
        files: {
          'dist/index.html': 'src/index.html'
        }
      }
    },
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'src/css',
          src: ['*.css', '!*.min.css'],
          dest: 'dist/css',
          ext: '.min.css'
        }]
      }
    },
    uglify: {
      target: {
        files: {
          'dist/js/app.min.js': ['src/js/app.js'],
          'dist/js/map.min.js': ['src/js/map.js']
        }
      },
      dev: {
        options: {
          beautify: true,
          compress: false
        },
        files: {
          'dist/js/app.min.js': ['src/js/app.js'],
          'dist/js/map.min.js': ['src/js/map.js'],
          'dist/js/offcanvas.min.js': ['src/js/offcanvas.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['jshint']);

};
