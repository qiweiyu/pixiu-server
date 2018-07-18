'use strict';

const Service = require('egg').Service;

class HouseService extends Service {
  async getData(url, params = {}) {
    let query = '';
    if (params) {
      query = [];
      for (const k in params) {
        const v = params[k];
        if (v !== undefined) {
          query.push(`${k}=${v}`);
        }
      }
      query = query.join('&');
    }
    let res;
    try {
      res = await this.app.curl(`${url}?${query}`, {
        dataType: 'json',
      });
      return res.data;
    } catch (e) {
      console.log(e);
      throw e.res;
    }
  }

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

  calBuyPrice(money) {}

  calSellPrice(amount) {}

  async buyMarket(amount, price) {
    return true;
  }

  async sellMarket(amount, price) {
    return true;
  }

}

module.exports = HouseService;
