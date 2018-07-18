'use strict';

const Subscription = require('egg').Subscription;
let locker = false;

class SyncCoinmarketcap extends Subscription {
  static get schedule() {
    return {
      interval: '30s',
      type: 'worker',
    };
  }

  async subscribe() {
    if (locker) {
      console.log('Not Run Sync CMC Cause Locker');
    } else {
      console.log('Run Sync for bitcoin');
      locker = true;
      try {
        await this.service.coinMarketCapSync.run('bitcoin');
      } catch (e) {
        console.log(e);
      }
      locker = false;
    }
  }
}

module.exports = SyncCoinmarketcap;
