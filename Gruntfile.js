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
        tasks: ['jshint']
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
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['jshint']);

};
