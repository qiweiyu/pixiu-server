'use strict';

const Controller = require('egg').Controller;

class PassportController extends Controller {
  async nonce() {
    this.ctx.body = await this.service.passport.nonce();
  }

  async login() {
    const params = this.ctx.request.params;
    this.ctx.body = await this.service.passport.login(params['sid'], params['address'], params['signedMessage']);
  }
}

module.exports = PassportController;
