'use strict';

const Subscription = require('egg').Subscription;
let locker = false;
let house = null;
let robot = null;
let lastInfo = null;

class SimZb extends Subscription {
  static get schedule() {
    return {
      interval: '5s',
      type: 'worker',
    };
  }

  async subscribe() {
    if (house === null) {
      house = this.service.houseZb;
      await house.init({
        beginMoney: 10000,
        beginAmount: 0,
      });
      robot = this.service.robotWenzhawenda;
      lastInfo = await robot.init(house);
    }
    if (locker) {
      console.log('Not Run Sim Zb Cause Locker');
    } else {
      console.log('Run Sim for zb');
      locker = true;
      try {
        await robot.house.fetchNext();
        lastInfo = await robot.tickHandler(null, lastInfo);
        console.log(await house.fetchAccount());
      } catch (e) {
        console.log(e);
      }
      locker = false;
    }
  }
}

module.exports = SimZb;
