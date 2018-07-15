'use strict';

const Service = require('egg').Service;

class HouseService extends Service {
  async init(options = {}) {
    if (this.inited) return false;
    this.inited = true;
    return true;
  }

  async fetchAccount() {
    return {
      money: 0,
      amount: 0,
    };
  }

  async fetchNext() {
    return {
      time: 0,
      price: 0,
    };
  }

  async buyMarket(amount, price) {
    return true;
  }

  async sellMarket(amount, price) {
    return true;
  }
}

module.exports = HouseService;
