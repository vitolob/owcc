const apiURLs = require('./api.js');
const registerSW = require('./registerServiceWorker.js');
const idb = require('./idb.js');

// HTML elements
const form = document.querySelector('#currencyForm');
const amountField = document.querySelector('#inputAmount');
const resultField = document.querySelector('#outputCurrency')
const selectFields = document.querySelectorAll('#currencyForm select');

class App {
  constructor(sw) {
    this._fetchCurrency();
    this._fetchConversionFactor();
    // registerSW();
    this._db = idb();
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

      fetch(fetchUrl)
        .then(response => {
          return response.json();
      }).then(handleData);

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

}

AppInstance = new App();
