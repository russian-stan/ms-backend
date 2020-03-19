const axios = require('axios');
const AppError = require('../utils/appError');

module.exports = async (url) => {
  try {
    const resp = await axios.get(url);
    return resp.data;
  } catch (err) {
    throw new AppError(err.message, err.response.status);
  }
};
