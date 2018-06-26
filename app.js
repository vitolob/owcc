const browserSync = require('browser-sync');

browserSync({
  server: ['src', 'build'],
  files: ['src/*.html', 'src/css/*.css']
});
