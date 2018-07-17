'use strict';

const Robot = require('./robot');

class RobotWenzhawendaService extends Robot {
  async init(house) {
    if (await super.init(house)) {
      this.gap = 0.003;
      this.perBuyMoney = 500;
      return {
        totalAmount: 0,
        nextBuyPrice: house.currentData.price * (1 + this.gap),
        nextSellPrice: house.currentData.price * (1 - this.gap),
      };
    }
    return false;
  }

  async tickHandler(time, price, lastInfo) {
    if (price > lastInfo.nextBuyPrice) {
      const res = await this.house.buyMarket(this.perBuyMoney);
      if (res) {
        lastInfo.totalAmount += res.amount;
        lastInfo.nextBuyPrice = res.price * (1 + this.gap);
        lastInfo.nextSellPrice = res.price * (1 - this.gap);
      } else {
        const price = this.house.currentData.price;
        lastInfo.nextBuyPrice = price * (1 + this.gap);
        lastInfo.nextSellPrice = price * (1 - this.gap);
      }
    } else if (price < lastInfo.nextSellPrice) {
      const totalAmount = (await this.house.fetchAccount()).amount;
      const res = await this.house.sellMarket(totalAmount);
      if (res) {
        lastInfo.totalAmount = 0;
        lastInfo.nextBuyPrice = res.price * (1 + this.gap);
        lastInfo.nextSellPrice = res.price * (1 - this.gap);
      }
    } else {
      console.log(price, 'Do nothing...');
    }
    return lastInfo;
  }
}

module.exports = RobotWenzhawendaService;
