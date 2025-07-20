const axios = require('axios');

// A custom function to be used to forward request to any microservice...
const forwardRequest = async (method, url, data = {}, headers = {}) => {
  try {
    const response = await axios({ method, url, data, headers });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: 'Service unavailable' };
  }
};

module.exports = { forwardRequest };
