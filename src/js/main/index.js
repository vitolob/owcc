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
