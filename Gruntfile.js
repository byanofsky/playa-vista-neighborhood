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
        tasks: ['jshint', 'copy:devScripts']
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
      },
      img: {
        files: 'src/img/**/*',
        tasks: ['copy:img']
      }
    },
    copy: {
      python: {
        expand: true,
        cwd: 'src',
        src: ['**/*.py', '!config-sample.py'],
        dest: 'dist/'
      },
      img: {
        expand: true,
        cwd: 'src/img',
        src: '**/*',
        dest: 'dist/img/'
      },
      devScripts: {
        expand: true,
        cwd: 'src/js',
        src: '*.js',
        dest: 'dist/js',
        ext: '.min.js'
      }
    },
    htmlmin: {
      build: {
        options: {
          removeComments: false,
          collapseWhitespace: true
        },
        expand: true,
        cwd: 'src/',
        src: '**/*.html',
        dest: 'dist/'
      }
    },
    cssmin: {
      build: {
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
      build: {
        expand: true,
        cwd: 'src/js',
        src: '*.js',
        dest: 'dist/js',
        ext: '.min.js'
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
  grunt.registerTask('buildDev', ['jshint', 'copy', 'htmlmin', 'cssmin']);
  grunt.registerTask(
    'build',
    ['jshint', 'copy:python', 'copy:img', 'htmlmin', 'cssmin', 'uglify']
  );
};
