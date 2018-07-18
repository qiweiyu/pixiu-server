'use strict';

const Robot = require('./robot');

class RobotWenzhawendaService extends Robot {
  async init(house) {
    if (await super.init(house)) {
      this.gap = 0.003;
      this.perBuyAmount = 1;
      return {
        totalAmount: 0,
        nextBuyPrice: house.currentData.price * (1 + this.gap),
        nextSellPrice: house.currentData.price * (1 - this.gap),
      };
    }
    return false;
  }

  async tickHandler(time, lastInfo) {
    // todo
    return true;
    // test buy
    const buyPrice = this.house.calBuyPrice(this.perBuyAmount);
    const sellPrice = this.house.calSellPrice(this.house.amount);
    if (buyPrice > lastInfo.nextBuyPrice || lastInfo.totalAmount === 0) {
      const res = await this.house.buy(this.perBuyAmount * buyPrice);
      if (res) {
        lastInfo.totalAmount += res.amount;
        lastInfo.nextBuyPrice = res.price * (1 + this.gap);
        lastInfo.nextSellPrice = res.price * (1 - this.gap);
      } else {
        const price = this.house.currentData.price;
        lastInfo.nextBuyPrice = price * (1 + this.gap);
        lastInfo.nextSellPrice = price * (1 - this.gap);
      }
    } else if (sellPrice < lastInfo.nextSellPrice) {
      const totalAmount = (await this.house.fetchAccount()).amount;
      const res = await this.house.sell(totalAmount);
      if (res) {
        lastInfo.totalAmount = 0;
        lastInfo.nextBuyPrice = 0;
        lastInfo.nextSellPrice = 0;
      }
    } else {
      console.log('Do nothing...');
    }
    return lastInfo;
  }
}

module.exports = RobotWenzhawendaService;
