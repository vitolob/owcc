const idb = require('idb');

function openDB() {
  if (!navigator.serviceWorker) {
    return Promise.resolve();
  }

  return idb.open('currency-db', 1, upgradedB => {
    const currencyStore = upgradedB.createObjectStore('currency');
  });
}

module.exports = openDB;
