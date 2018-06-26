const apiURLs = require('./api.js');

// HTML elements
const form = document.querySelector('#currencyForm');
const amountField = document.querySelector('#inputAmount');
const resultField = document.querySelector('#outputCurrency')
const selectFields = document.querySelectorAll('#currencyForm select');

class App {

  init() {
    this.fetchConversionFactor();
    this.fetchCurrency();
  }

  fetchConversionFactor() {

    form.addEventListener('submit', event => {
      event.preventDefault();

      const fetchUrl = apiURLs.baseURL + apiURLs.exchangeRate + 'USD_MZN,MZM_USD' + apiURLs.extra;
      const AMOUNT = Number(amountField.value);

      const handleData = function (data) {
        const XR = Number(data.USD_MZN) // Exchange Rate

        resultField.value = XR * AMOUNT;
      }

      fetch(fetchUrl)
        .then(response => {
          return response.json();
      }).then(handleData);

      // amount.value = ''; // Clear the input field
      });
  }

  fetchCurrency() {
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
AppInstance.init();
