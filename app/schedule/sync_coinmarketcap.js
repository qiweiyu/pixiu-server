'use strict';

const Subscription = require('egg').Subscription;

class SyncCoinmarketcap extends Subscription {
  static get schedule() {
    return {
      interval: '30s',
      type: 'worker',
    };
  }

  async subscribe() {
    [ 'bitcoin' ].forEach(symbol => {
      this.service.coinMarketCapSync.run(symbol);
    });
  }
}

module.exports = SyncCoinmarketcap;