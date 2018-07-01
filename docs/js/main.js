(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Full URL: apiURLs.baseURL + apiURLs.* [+ apiURLs.extra];

const apiURLs = {
  baseURL : 'https://free.currencyconverterapi.com',
  exchangeRate: '/api/v5/convert?q=',
  currencyList: '/api/v5/currencies',
  countryList: '/api/v5/countries',
  extra: '&compact=ultra'
}

module.exports = apiURLs;

},{}],2:[function(require,module,exports){
const apiURLs = require('./api.js');
const sw = require('./indexSW.js');

// HTML elements
const form = document.querySelector('#currencyForm');
const amountField = document.querySelector('#inputAmount');
const resultField = document.querySelector('#outputCurrency')
const selectFields = document.querySelectorAll('#currencyForm select');

class App {
  constructor() {
    this._fetchCurrency();
    this._fetchConversionFactor();
  }

  _fetchConversionFactor() {

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
}

AppInstance = new App();
SWInstance = new sw();

},{"./api.js":1,"./indexSW.js":3}],3:[function(require,module,exports){
class SW {
  constructor() {
    this._register();
  }

  _register() {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.register('/sw.js')
      .then(() => {
        console.log('Yeah! It worked!');
    }).catch(() => {
      console.log('Registration failed :-(');
    });
  }
}

module.exports = SW;

},{}]},{},[2]);
