'use strict';

const Service = require('egg').Service;

class UserService extends Service {
  loginRequired() {
    this.ctx.throw(401, 'LOGIN REQUIRED', {
      data: {},
    });
  }

  async login(address) {
    const token = this.service.session.generateToken();
    await this.service.session.set(address, token);
    this.ctx.user = { address, token };
    return { address, token };
  }
}

module.exports = UserService;
