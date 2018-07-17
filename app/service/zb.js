'use strict';

const Service = require('egg').Service;

class ZbService extends Service {
  getKlineTableName(symbol, type) {
    return `zb_${symbol}_${type}`;
  }
}

module.exports = ZbService;
