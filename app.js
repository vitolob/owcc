const browserSync = require('browser-sync');

browserSync({
  server: ['src', 'build'],
  files: ['build/*.html', 'build/css/*.css']
});
