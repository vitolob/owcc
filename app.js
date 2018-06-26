const browserSync = require('browser-sync');

browserSync({
  server: 'src',
  files: ['src/*.html']
});
