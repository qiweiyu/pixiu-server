'use strict';

const House = require('./house');

class HouseMockService extends House {
  async init(options = {}) {
    if (await super.init(options)) {
      this.fee = options.fee || 0.002;
      this.currentPosTime = options.currentPosTime || 0;
      this.currentData = null;
      this.beginMoney = options.beginMoney || 0;
      this.beginAmount = options.beginAmount || 0;
      this.money = this.beginMoney;
      this.amount = this.beginAmount;
      this.symbol = 'bitcoin';
      this.type = 'usd';
      this.tableName = this.service.coinMarketCap.getTableName(this.symbol, this.type);
      await this.fetchNext();
      return true;
    }
    return false;
  }

  async fetchAccount() {
    return {
      money: this.money,
      amount: this.amount,
    };
  }

  async fetchNext() {
    const res = (await this.app.mysql.query(`select * from ${this.tableName} where time > ? order by time asc limit 1`, [this.currentPosTime]))[0];
    if (!res) {
      throw 'No more trading data after ' + this.currentPosTime;
    }
    this.currentData = res;
    this.currentPosTime = res.time;
    return {
      time: res.time,
      price: res.price,
    };
  }

  async buyMarket(money) {
    console.log('buy market ', money);
    if (money > this.money) {
      console.log('Money is not enough to buy');
      return false;
    }
    const amount = Number(money / this.currentData.price * (1 - this.fee)).toFixed(8);
    this.money -= money;
    this.amount = Number(this.amount) + Number(amount);
    return {
      price: this.currentData.price,
      money,
      amount,
    };
  }

  async sellMarket(amount) {
    console.log('sell market ', amount);
    if (amount > this.amount) {
      console.log('Amount is not enough to sell');
      return false;
    }
    const money = Number(amount * this.currentData.price * (1 - this.fee)).toFixed(2);
    this.money = Number(this.money) + Number(money);
    this.amount -= Number(amount);
    return {
      price: this.currentData.price,
      money,
      amount,
    };
  }
}

module.exports = HouseMockService;
