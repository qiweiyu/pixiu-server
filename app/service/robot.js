'use strict';

const Service = require('egg').Service;

class RobotService extends Service {
  async init(house) {
    if (this.inited) return false;
    this.house = house;
    this.inited = true;
    return true;
  }

  async tickHandler(time, price, lastInfo) {
    console.log(`robot handle at ${time} on ${price}`);
    return lastInfo;
  }
}

module.exports = RobotService;
