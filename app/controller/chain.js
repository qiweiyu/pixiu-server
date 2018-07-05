'use strict';

const Controller = require('egg').Controller;

class ChainController extends Controller {
  async conf() {
    const chainId = this.ctx.params[0];
    if (!chainId) {
      this.ctx.throw(404);
    }
    const chain = await this.service.chain.fetchByChainId(chainId);
    console.log(chain);
    if (!chain) {
      this.ctx.throw(404);
    }
    this.ctx.body = this.service.chain.generateConf(chain);
  }
}

module.exports = ChainController;
