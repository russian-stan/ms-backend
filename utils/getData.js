const axios = require('axios');

module.exports = async (url) => {
  try {
    const resp = await axios.get(url);
    return  resp.data;
  } catch(err) {
    throw new Error(err.message);
  }
};
