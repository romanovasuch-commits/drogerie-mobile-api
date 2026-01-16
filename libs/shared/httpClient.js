const axios = require("axios");

function makeClient(baseURL) {
  const client = axios.create({ baseURL, timeout: 5000 });
  return client;
}

module.exports = { makeClient };