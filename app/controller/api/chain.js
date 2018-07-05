'use strict';

const Controller = require('egg').Controller;

class ChainController extends Controller {
  async list() {
    let condition = {};
    try {
      condition = JSON.parse(this.ctx.request.params['where']);
    } catch (e) {
    }
    this.ctx.body = {
      list: await this.service.chain.getChainDataListWithCondition(this.ctx.request.params['start'], this.ctx.request.params['length'], condition),
      total: await this.service.chain.getChainCountWithCondition(condition),
    };
  }

  async launch() {
    const params = this.ctx.request.params;
    await this.service.chain.create(params, this.ctx.user.address);
    this.ctx.body = {
      chainId: params.chainId,
    };
  }

  async info() {
    this.ctx.body = await this.service.chain.info(this.ctx.request.params['chainId']);
  }
}

module.exports = ChainController;
