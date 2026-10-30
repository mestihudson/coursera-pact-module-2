const axios = require('axios');

class TransactionClient {
  constructor(baseURL) {
    this.http = axios.create({ baseURL, timeout: 5000 });
  }

  async getTransactions() {
    const { data } = await this.http.get('/transactions');
    return data;
  }
}

module.exports = { TransactionClient };
