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
const protocol = 'https';

class ZbSyncService extends Service {
  async fetch(url) {
    let res;
    try {
      res = await this.app.curl(`${protocol}://${host}${url}`, {
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
      INDEX i_time (\`time\`),
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
  }

  async fetchLastTime(symbol, type) {
    let lastTime = 0;
    try {
      const res = (await this.app.mysql.select(this.getTableName(symbol, type), {
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

  async fetchALine(symbol, type, since) {
    const fetchRes = await this.fetch(`/data/v1/kline?market=${symbol}_qc&type=${type}&since=${since}`);
    console.log(fetchRes);
    return true; //////
    const data = fetchRes[`price_${type}`];
    if (!data) {
      return false;
    }
    let beginTime = Date.now();
    let endTime = 0;
    const dataMap = {};
    data.forEach(item => {
      beginTime = Math.min(item[0], beginTime);
      endTime = Math.max(item[0], endTime);
      dataMap[item[0]] = item[1];
    });
    const tableName = this.getTableName(symbol, type);
    (await this.app.mysql.query(`select * from ${tableName} where time >= ${beginTime} and time <= ${endTime}`)).forEach(item => {
      dataMap[item.time] = null;
    });
    const formatBeginTime = Math.round(beginTime / 60 / 1000) * 60 * 1000;
    const dateBeginTime = Math.floor(beginTime / (86400 * 1000)) * 86400 * 1000;
    for (const time in dataMap) {
      const price = dataMap[time];
      const formatTime = Math.round((time - formatBeginTime) / 300 / 1000) * 300 * 1000 + dateBeginTime;
      if (price) {
        const date = moment(new Date(Number(time))).utc().format('YYYYMMDD');
        await this.app.mysql.insert(tableName, {
          time,
          formatTime,
          date,
          price,
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
      'hlc', 'btn', 'safe'
    ];
    const typeList = [
      '1min', '1hour', '1day',
    ];
    let lastTime = await this.fetchLastTime(symbol, type);
    const now = Date.now();
    let res = false;
    do {
      res = await this.runADay(symbol, type, lastTime);
      await Sleep();
      lastTime += 86400000;
    } while (res && now > lastTime);
  }
}

module.exports = ZbSyncService;
