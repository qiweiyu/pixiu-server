'use strict';

const Subscription = require('egg').Subscription;
let locker = false;

class SyncZb extends Subscription {
  static get schedule() {
    return {
      interval: '5m',
      type: 'worker',
    };
  }

  async subscribe() {
    if (locker) {
      console.log('Not Run Sync Zb Cause Locker');
    } else {
      console.log('Run Sync for zb');
      locker = true;
      try {
        await this.service.zbSync.run();
      } catch (e) {
        console.log(e);
      }
      locker = false;
    }
  }
}

module.exports = SyncZb;
