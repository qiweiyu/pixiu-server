'use strict';

const Robot = require('./robot');

class RobotJianhaojiushouService extends Robot {
  async init(house) {
    if (await super.init(house)) {
      this.perBuyMoney = 10;
      return {
        totalAmount: 0,
        avaPrice: 0,
      };
    }
    return false;
  }

  async tickHandler(time, price, lastInfo) {
    if (price > lastInfo.avaPrice*(1.01) && lastInfo.totalAmount > 0) {
      const totalAmount = (await this.house.fetchAccount()).amount;
      const res = await this.house.sellMarket(totalAmount);
      if (res) {
        lastInfo.totalAmount = 0;
        lastInfo.avaPrice = 0;
      }
    } else {
      const res = await this.house.buyMarket(this.perBuyMoney);
      if (res) {
        lastInfo.avaPrice = lastInfo.totalAmount * lastInfo.avaPrice + res.amount * res.price;
        lastInfo.totalAmount = Number(res.amount) + Number(lastInfo.totalAmount);
        lastInfo.avaPrice = lastInfo.avaPrice / lastInfo.totalAmount;
      } else {
        console.log('Buy failed');
      }
    }
    return lastInfo;
  }
}

module.exports = RobotJianhaojiushouService;
