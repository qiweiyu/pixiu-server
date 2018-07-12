'use strict';

const Service = require('./coinMarketCap');

class HistoryService extends Service {
  async fetchPrice(symbol, type, begin, end, length = 100) {
    if (!this.app.config.coins.includes(symbol)) {
      this.ctx.throw(404);
    }
    // todo should valid type
    type = 'usd';
    const parseRes = await this.parseStartEnd(symbol, type, begin, end);
    begin = parseRes.begin;
    end = parseRes.end;
    const delta = (end - begin) / length;
    const formatTimeList = [];
    for (let i = 0; i < length; i++) {
      formatTimeList.push(this.formatTime(begin + delta * i));
    }
    return (await this.app.mysql.select(this.getTableName(symbol, type), {
      where: {
        formatTime: formatTimeList,
      },
      orders: [['time', 'asc']],
    })).map(item => {
      return {
        time: item.time,
        price: item.price,
      };
    });
  }

  async parseStartEnd(symbol, type, begin, end) {
    const tableName = this.getTableName(symbol, type);
    let res = await this.app.mysql.select(tableName, {
      orders: [['time', 'asc']],
      limit: 1,
    });
    const minBegin = Number(res && res[0] && res[0].time);
    res = await this.app.mysql.select(tableName, {
      orders: [['time', 'desc']],
      limit: 1,
    });
    const maxEnd = Number(res && res[0] && res[0].time);
    begin = Math.max(begin, minBegin);
    if (end <= 0) {
      end = maxEnd;
    }
    end = Math.min(end, maxEnd);
    if (begin >= end) {
      begin = minBegin;
      end = maxEnd;
    }
    begin = this.formatTime(begin);
    end = this.formatTime(end);
    return { begin, end };
  }

  formatTime(time) {
    return Math.round(time / 300 / 1000) * 300 * 1000;
  }
}

module.exports = HistoryService;
