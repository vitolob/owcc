const browserSync = require('browser-sync');

browserSync({
  server: ['docs'],
  files: ['docs/*.html', 'docs/css/*.css']
});
