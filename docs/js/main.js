(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

(function() {
  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  function promisifyRequest(request) {
    return new Promise(function(resolve, reject) {
      request.onsuccess = function() {
        resolve(request.result);
      };

      request.onerror = function() {
        reject(request.error);
      };
    });
  }

  function promisifyRequestCall(obj, method, args) {
    var request;
    var p = new Promise(function(resolve, reject) {
      request = obj[method].apply(obj, args);
      promisifyRequest(request).then(resolve, reject);
    });

    p.request = request;
    return p;
  }

  function promisifyCursorRequestCall(obj, method, args) {
    var p = promisifyRequestCall(obj, method, args);
    return p.then(function(value) {
      if (!value) return;
      return new Cursor(value, p.request);
    });
  }

  function proxyProperties(ProxyClass, targetProp, properties) {
    properties.forEach(function(prop) {
      Object.defineProperty(ProxyClass.prototype, prop, {
        get: function() {
          return this[targetProp][prop];
        },
        set: function(val) {
          this[targetProp][prop] = val;
        }
      });
    });
  }

  function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return this[targetProp][prop].apply(this[targetProp], arguments);
      };
    });
  }

  function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyCursorRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function Index(index) {
    this._index = index;
  }

  proxyProperties(Index, '_index', [
    'name',
    'keyPath',
    'multiEntry',
    'unique'
  ]);

  proxyRequestMethods(Index, '_index', IDBIndex, [
    'get',
    'getKey',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(Index, '_index', IDBIndex, [
    'openCursor',
    'openKeyCursor'
  ]);

  function Cursor(cursor, request) {
    this._cursor = cursor;
    this._request = request;
  }

  proxyProperties(Cursor, '_cursor', [
    'direction',
    'key',
    'primaryKey',
    'value'
  ]);

  proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
    'update',
    'delete'
  ]);

  // proxy 'next' methods
  ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
    if (!(methodName in IDBCursor.prototype)) return;
    Cursor.prototype[methodName] = function() {
      var cursor = this;
      var args = arguments;
      return Promise.resolve().then(function() {
        cursor._cursor[methodName].apply(cursor._cursor, args);
        return promisifyRequest(cursor._request).then(function(value) {
          if (!value) return;
          return new Cursor(value, cursor._request);
        });
      });
    };
  });

  function ObjectStore(store) {
    this._store = store;
  }

  ObjectStore.prototype.createIndex = function() {
    return new Index(this._store.createIndex.apply(this._store, arguments));
  };

  ObjectStore.prototype.index = function() {
    return new Index(this._store.index.apply(this._store, arguments));
  };

  proxyProperties(ObjectStore, '_store', [
    'name',
    'keyPath',
    'indexNames',
    'autoIncrement'
  ]);

  proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'put',
    'add',
    'delete',
    'clear',
    'get',
    'getAll',
    'getKey',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'openCursor',
    'openKeyCursor'
  ]);

  proxyMethods(ObjectStore, '_store', IDBObjectStore, [
    'deleteIndex'
  ]);

  function Transaction(idbTransaction) {
    this._tx = idbTransaction;
    this.complete = new Promise(function(resolve, reject) {
      idbTransaction.oncomplete = function() {
        resolve();
      };
      idbTransaction.onerror = function() {
        reject(idbTransaction.error);
      };
      idbTransaction.onabort = function() {
        reject(idbTransaction.error);
      };
    });
  }

  Transaction.prototype.objectStore = function() {
    return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
  };

  proxyProperties(Transaction, '_tx', [
    'objectStoreNames',
    'mode'
  ]);

  proxyMethods(Transaction, '_tx', IDBTransaction, [
    'abort'
  ]);

  function UpgradeDB(db, oldVersion, transaction) {
    this._db = db;
    this.oldVersion = oldVersion;
    this.transaction = new Transaction(transaction);
  }

  UpgradeDB.prototype.createObjectStore = function() {
    return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
  };

  proxyProperties(UpgradeDB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(UpgradeDB, '_db', IDBDatabase, [
    'deleteObjectStore',
    'close'
  ]);

  function DB(db) {
    this._db = db;
  }

  DB.prototype.transaction = function() {
    return new Transaction(this._db.transaction.apply(this._db, arguments));
  };

  proxyProperties(DB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(DB, '_db', IDBDatabase, [
    'close'
  ]);

  // Add cursor iterators
  // TODO: remove this once browsers do the right thing with promises
  ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
    [ObjectStore, Index].forEach(function(Constructor) {
      // Don't create iterateKeyCursor if openKeyCursor doesn't exist.
      if (!(funcName in Constructor.prototype)) return;

      Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
        var args = toArray(arguments);
        var callback = args[args.length - 1];
        var nativeObject = this._store || this._index;
        var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
        request.onsuccess = function() {
          callback(request.result);
        };
      };
    });
  });

  // polyfill getAll
  [Index, ObjectStore].forEach(function(Constructor) {
    if (Constructor.prototype.getAll) return;
    Constructor.prototype.getAll = function(query, count) {
      var instance = this;
      var items = [];

      return new Promise(function(resolve) {
        instance.iterateCursor(query, function(cursor) {
          if (!cursor) {
            resolve(items);
            return;
          }
          items.push(cursor.value);

          if (count !== undefined && items.length == count) {
            resolve(items);
            return;
          }
          cursor.continue();
        });
      });
    };
  });

  var exp = {
    open: function(name, version, upgradeCallback) {
      var p = promisifyRequestCall(indexedDB, 'open', [name, version]);
      var request = p.request;

      if (request) {
        request.onupgradeneeded = function(event) {
          if (upgradeCallback) {
            upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
          }
        };
      }

      return p.then(function(db) {
        return new DB(db);
      });
    },
    delete: function(name) {
      return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = exp;
    module.exports.default = module.exports;
  }
  else {
    self.idb = exp;
  }
}());

},{}],2:[function(require,module,exports){
// Full URL: apiURLs.baseURL + apiURLs.* [+ apiURLs.extra];

const apiURLs = {
  baseURL : 'https://free.currencyconverterapi.com',
  exchangeRate: '/api/v5/convert?q=',
  currencyList: '/api/v5/currencies',
  countryList: '/api/v5/countries',
  extra: '&compact=ultra'
}

module.exports = apiURLs;

},{}],3:[function(require,module,exports){
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

},{"idb":1}],4:[function(require,module,exports){
const apiURLs = require('./api.js');
const registerSW = require('./registerServiceWorker.js');
const idb = require('./idb.js');

// HTML elements
const form = document.querySelector('#currencyForm');
const amountField = document.querySelector('#inputAmount');
const resultField = document.querySelector('#outputCurrency')
const selectFields = document.querySelectorAll('#currencyForm select'); // Currency Dropdown Fields

class App {
  constructor(sw) {
    registerSW();
    this._db = idb();
    this._fetchCurrency();
    this._fetchConversionFactor();
  }

  _fetchConversionFactor() {
    const App = this;

    form.addEventListener('submit', event => {
      event.preventDefault();

      // document.querySelectorAll returns NodeList in document order
      const sourceCurrency = selectFields[0].selectedOptions[0].value;
      const targetCurrency = selectFields[1].selectedOptions[0].value;
      const query = `${sourceCurrency}_${targetCurrency}`;

      const fetchUrl = apiURLs.baseURL + apiURLs.exchangeRate + query + apiURLs.extra;
      const AMOUNT = Number(amountField.value);

      const handleData = function (data) {
        const XR = Number(data[query]); // Exchange Rate

        resultField.value = +(XR * AMOUNT).toFixed(3);
        App._addCurrencyToDB(query, XR);
      }

      App._getCurrencyFromDB(query).then(val => {
        if (val == undefined) {
          fetch(fetchUrl)
            .then(response => response.json())
            .then(handleData);
        }
        else {
          console.log(val);
          resultField.value = +(val * AMOUNT).toFixed(3);
        }
      });

      // amount.value = ''; // Clear the input field
      });
  }

  _fetchCurrency() {
    const currencyUrl = apiURLs.baseURL + apiURLs.currencyList;

    const handleData = function(data) {
      const results = data.results;
      const currencyList = Object.keys(results);
      let currencyOptionHTML = '';

      for (let currency of currencyList) {
        currencyOptionHTML += `<option value=${currency}>${currency} - ${results[currency].currencyName}</option>`;
      }

       selectFields.forEach(elem => {
         elem.innerHTML = currencyOptionHTML;
       });
    }

    fetch(currencyUrl)
      .then(response => {
      return response.json();
    }).then(handleData);
  }

  _addCurrencyToDB(key, val) {
    const dbPromise = this._db;

    dbPromise.then(db => {
      const tx = db.transaction('currency', 'readwrite');
      const currencyStore = tx.objectStore('currency');
      currencyStore.put(val, key);
    });
  }

  _getCurrencyFromDB(key) {
    const dbPromise = this._db;

    return dbPromise.then(db => {
      const tx = db.transaction('currency');
      const currencyStore = tx.objectStore('currency');
      return currencyStore.get(key);
    });
  }

}

AppInstance = new App();

},{"./api.js":2,"./idb.js":3,"./registerServiceWorker.js":5}],5:[function(require,module,exports){
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

},{}]},{},[4]);
