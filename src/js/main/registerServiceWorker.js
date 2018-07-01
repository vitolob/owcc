function registerSW() {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('/sw.js')
    .then(() => {
      console.log('Yeah! It worked!');
  }).catch(() => {
    console.log('Registration failed :-(');
  });
}

module.exports = registerSW;
