const form = document.querySelector('#currencyForm');
const amountField = document.querySelector('#inputAmount');
const resultField = document.querySelector('#outputCurrency')
const apiURL = 'https://free.currencyconverterapi.com/api/v5/convert?q=USD_MZN,MZN_USD&compact=ultra';

form.addEventListener('submit', event => {
  event.preventDefault();

  const AMOUNT = Number(amountField.value);

  function handleData(data) {
    const XR = Number(data.USD_MZN) // Exchange Rate

    resultField.value = XR * AMOUNT;
  }

  fetch(apiURL)
    .then(response => {
      return response.json();
  }).then(handleData);

  // amount.value = ''; // Clear the input field
});
