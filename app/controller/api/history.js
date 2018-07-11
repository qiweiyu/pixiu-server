'use strict';

const Controller = require('egg').Controller;

class HistoryController extends Controller {
  async test() {
    this.ctx.body = await this.service.coinMarketCap.test();
  }
}

module.exports = HistoryController;
