'use strict';

const House = require('./house');
const hash = require('jshashes');
const ak = 'ed3c5eb3-c5ae-4af7-abc1-427587f922ac';
const sk = 'bf06be54-8323-4f27-9cba-d89f0a6baf34';
const encryptSk = (new hash.SHA1).hex(sk);

const signature = (params) => {
  const query = [];
  for (const k in params) {
    const v = params[k];
    if (v === undefined) {
      continue;
    }
    if (k === 'reqTime') {
      continue;
    }
    query.push(`${k}=${v}`);
  }
  return (new hash.MD5).hex_hmac(encryptSk, query.sort().join('&'));
};

class HouseZbService extends House {
  async init(options = {}) {
    if (await super.init(options)) {
      this.fee = options.fee || 0.002;
      this.money = 5000;
      this.amount = 0;
      this.markets = options.fee || [
        //  'zb_qc',
        //  'btc_qc',
        'eos_qc',
        //  'eth_qc',
        //  'qtum_qc',
      ];
      this.currentData = {};
      const fetchList = [];
      this.markets.forEach(market => {
        fetchList.push(this.fetchNext(market));
      });
      await Promise.all(fetchList);
      return true;
    }
    return false;
  }

  async fetchAccount() {
    const params = {
      accesskey: ak,
      method: 'getAccountInfo',
      reqTime: Date.now(),
    };
    params.sign = signature(params);
    const res = await this.getData('https://trade.zb.cn/api/getAccountInfo', params);
    const account = {};
    res.result.coins.forEach(item => {
      account[item.key] = item.available;
    });
    console.log(account);
    this.money = Number(account.qc);
    this.amount = Number(account.eos);
    return account;
  }

  async fetchNext(market = 'eos_qc') {
    const res = await this.getData('http://api.zb.cn/data/v1/depth', {
      market,
      size: 50,
    });
    this.currentData[market] = res;
  }

  calBuyPrice(amount, market = 'eos_qc') {
    const sellList = this.currentData[market].asks.sort((a, b) => {
      return a[0] > b[0] ? 1 : -1;
    });
    let totalAmount = 0;
    let totalMoney = 0;
    for (let i = 0; i < sellList.length; i++) {
      if (i < 3) continue; //skip first three for the slow network
      totalAmount = totalAmount + Number(sellList[i][1]);
      totalMoney = totalMoney + sellList[i][0] * sellList[i][1];
      if (totalAmount > amount) break;
    }
    return totalMoney / totalAmount;
  }

  calSellPrice(amount, market = 'eos_qc') {
    const sellList = this.currentData[market].bids.sort((a, b) => {
      return a[0] < b[0] ? 1 : -1;
    });
    let totalAmount = 0;
    let totalMoney = 0;
    for (let i = 0; i < sellList.length; i++) {
      if (i < 3) continue; //skip first three for the slow network
      totalAmount = totalAmount + Number(sellList[i][1]);
      totalMoney = totalMoney + sellList[i][0] * sellList[i][1];
      if (totalAmount > amount) break;
    }
    return totalMoney / totalAmount;
  }

  async buy(amount, price, market = 'eos_qc') {
    console.log('buy market ', amount);
    const params = {
      accesskey: ak,
      method: 'order',
      reqTime: Date.now(),
      price,
      amount,
      tradeType: 1,
      currency: market,
    };
    params.sign = signature(params);
    const res = await this.getData('https://trade.zb.cn/api/order', params);
    console.log(res);
  }

  async sell(amount, price, market = 'eos_qc') {
    console.log('sell market ', amount);
    const params = {
      accesskey: ak,
      method: 'order',
      reqTime: Date.now(),
      price,
      amount,
      tradeType: 0,
      currency: market,
    };
    params.sign = signature(params);
    const res = await this.getData('https://trade.zb.cn/api/order', params);
    console.log(res);
  }
}

module.exports = HouseZbService;
