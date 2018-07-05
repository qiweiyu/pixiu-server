'use strict';

const Service = require('egg').Service;

class PassportService extends Service {
  async restoreUser(accessToken) {
    if (!accessToken) {
      return this.service.user.loginRequired();
    }
    const [address, token] = accessToken.split('@');
    const session = await this.service.session.get(address);
    if (!session || session.token !== token) {
      return this.service.user.loginRequired();
    } else {
      this.service.session.refresh(address);
      this.ctx.user = { address, token };
    }
  }

  async nonce() {
    const rs = require('crypto-random-string');
    const id = this.service.session.generateToken();
    const msg = rs(32);
    await this.service.session.set(id, msg);
    return {
      sid: id,
      msg,
    };
  }

  async login(sid, address, signedMessage) {
    try {
      const checkRes = await this.verifySignedMsg(sid, address, signedMessage);
      if (!checkRes) {
        throw this.ctx.errMap['MESSAGE_VERIFY_FAIL'];
      }
    } catch (e) {
      console.log(e);
      throw this.ctx.errMap['MESSAGE_VERIFY_FAIL'];
    }
    return this.service.user.login(address);
  }

  async verifySignedMsg(sid, address, signedMessage) {
    const msg = await this.service.session.get(sid);
    const bmessage = require('bitcoinjs-message');
    const qtumJs = require('qtumjs-lib');
    return bmessage.verify(msg.token, address, signedMessage, qtumJs.networks.qtum.messagePrefix);
  }
}

module.exports = PassportService;
