'use strict';

const Controller = require('egg').Controller;

class HistoryController extends Controller {
  async list() {
    const params = this.ctx.request.params;
    this.ctx.body = await this.service.history.fetchPrice(params.coin, 'usd', params.begin, params.end);
  }
}

module.exports = HistoryController;
