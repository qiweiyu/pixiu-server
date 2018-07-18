'use strict';

const Service = require('./zb');
const Sleep = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};
const host = 'api.zb.cn';
const protocol = 'http';

class ZbSyncService extends Service {
  async fetch(url, params = {}) {
    let query = '';
    if (params) {
      query = [];
      for (const k in params) {
        const v = params[k];
        if (v !== undefined) {
          query.push(`${k}=${v}`);
        }
      }
      query = query.join('&');
    }
    let res;
    try {
      res = await this.app.curl(`${protocol}://${host}${url}?${query}`, {
        dataType: 'json',
      });
      return res.data;
    } catch (e) {
      console.log(e);
      throw e.res;
    }
  }

  getKlineTableCreateSql(symbol, type) {
    const tableName = this.getKlineTableName(symbol, type);
    return `CREATE TABLE \`${tableName}\` (
      \`id\` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
      \`time\` bigint(20) unsigned NOT NULL,
      \`open\` double NOT NULL,
      \`high\` double NOT NULL,
      \`low\` double NOT NULL,
      \`close\` double NOT NULL,
      \`amount\` double NOT NULL,
      PRIMARY KEY (\`id\`),
      INDEX i_time (\`time\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
  }

  async fetchLastTime(symbol, type) {
    let lastTime = 0;
    try {
      const res = (await this.app.mysql.select(this.getKlineTableName(symbol, type), {
        orders: [['time', 'desc']],
      }))[0];
      lastTime = res && res.time;
    } catch (e) {
      console.log(e);
      if (e.code === 'ER_NO_SUCH_TABLE') {
        await this.app.mysql.query(this.getKlineTableCreateSql(symbol, type));
      }
      throw e;
    }
    return lastTime ? Number(lastTime) : 0;
  }

  async fetchALine(symbol, type) {
    const since = await this.fetchLastTime(symbol, type);
    const params = {
      market: `${symbol}_qc`,
      type,
      since,
    };
    let fetchRes = await this.fetch('/data/v1/kline', params);
    if (fetchRes.code === 3005) {
      await Sleep();
      params.since = undefined;
      fetchRes = await this.fetch('/data/v1/kline', params);
    }
    const klineData = fetchRes.data;
    if (!klineData) {
      return false;
    }
    let beginTime = Date.now();
    let endTime = 0;
    const dataMap = {};
    klineData.forEach(item => {
      beginTime = Math.min(item[0], beginTime);
      endTime = Math.max(item[0], endTime);
      dataMap[item[0]] = item;
    });
    const tableName = this.getKlineTableName(symbol, type);
    (await this.app.mysql.query(`select * from ${tableName} where time >= ${beginTime} and time <= ${endTime}`)).forEach(item => {
      dataMap[item.time] = null;
    });
    for (const time in dataMap) {
      const data = dataMap[time];
      if (data) {
        await this.app.mysql.insert(tableName, {
          time,
          open: data[1],
          high: data[2],
          low: data[3],
          close: data[4],
          amount: data[5],
        });
      }
    }
    return true;
  }

  async run() {
    const symbolList = [
      'eos', 'btc', 'eth', 'bts', 'dash',
      'zb', 'etc', 'bcc', 'hsr', 'xrp',
      'ltc', 'qtum', 'ae', 'true', 'chat',
      'ada', 'bitcny', 'ink', 'btm', 'bth',
      'tv', 'doge', 'btp', 'epc', 'bcw',
      'hlc', 'btn', 'safe',
    ];
    const typeList = [
      '1min', '1hour', '1day',
    ];
    for (let i = 0; i < typeList.length; i++) {
      const type = typeList[i];
      for (let j = 0; j < symbolList.length; j++) {
        const symbol = symbolList[j];
        await this.fetchALine(symbol, type);
        await Sleep();
      }
    }
  }
}

module.exports = ZbSyncService;
