const form = document.querySelector('#currencyForm');
const amountField = document.querySelector('#inputAmount');
const resultField = document.querySelector('#outputCurrency')
const apiURLs = require('./api.js');

form.addEventListener('submit', event => {
  event.preventDefault();

  const fetchUrl = apiURLs.baseURL + apiURLs.exchangeRate + 'USD_MZN,MZM_USD' + apiURLs.extra;
  const AMOUNT = Number(amountField.value);

  function handleData(data) {
    const XR = Number(data.USD_MZN) // Exchange Rate

    resultField.value = XR * AMOUNT;
  }

  fetch(fetchUrl)
    .then(response => {
      return response.json();
  }).then(handleData);

  // amount.value = ''; // Clear the input field
});
