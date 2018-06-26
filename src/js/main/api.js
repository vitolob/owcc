// Full URL: apiURLs.baseURL + apiURLs.* [+ apiURLs.extra];

const apiURLs = {
  baseURL : 'https://free.currencyconverterapi.com',
  exchangeRate: '/api/v5/convert?q=',
  currencyList: '/api/v5/currencies',
  countryList: '/api/v5/countries',
  extra: '&compact=ultra'
}

module.exports = apiURLs;
