'use strict';

const Service = require('egg').Service;

class CoinMarketCapService extends Service {
  getTableName(symbol, type) {
    return `cmc_${symbol}_${type}`;
  }
}

module.exports = CoinMarketCapService;
