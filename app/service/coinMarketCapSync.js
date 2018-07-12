'use strict';

const Service = require('./coinMarketCap');
const moment = require('moment');
const Sleep = (time = 3000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};
const host = 'graphs2.coinmarketcap.com';
const protocol = 'https';

class CoinMarketCapSyncService extends Service {
  fetchPriceUrl(symbol, start, end) {
    return `${protocol}://${host}/currencies/${symbol}/${start}/${end}/`;
  }

  async fetch(url) {
    let res;
    try {
      res = await this.app.curl(url, {
        dataType: 'json',
      });
      return res.data;
    } catch (e) {
      console.log(e);
      throw e.res;
    }
  }

  async fetchByDay(symbol, time) {
    const day = Math.floor(time / (86400 * 1000)) * 86400 * 1000;
    return await this.fetch(this.fetchPriceUrl(symbol, day, day + 86400 * 1000));
  }

  getTableCreateSql(symbol, type) {
    const tableName = this.getTableName(symbol, type);
    return `CREATE TABLE \`${tableName}\` (
      \`id\` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
      \`time\` bigint(20) unsigned NOT NULL,
      \`formatTime\` bigint(20) NOT NULL,
      \`date\` varchar(8) NOT NULL,
      \`price\` double NOT NULL,
      PRIMARY KEY (\`id\`),
      INDEX i_time (\`time\`),
      INDEX i_formatTime (\`formatTime\`),
      INDEX i_date (\`date\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
  }

  async fetchLastTime(symbol, type) {
    try {
      const res = (await this.app.mysql.select(this.getTableName(symbol, type), {
        orders: [['time', 'desc']],
      }))[0];
      return Number(res && res.time);
    } catch (e) {
      console.log(e);
      if (e.code === 'ER_NO_SUCH_TABLE') {
        await this.app.mysql.query(this.getTableCreateSql(symbol, type));
        return 0;
      }
      throw e;
    }
  }

  async runADay(symbol, type, time) {
    const fetchRes = await this.fetchByDay(symbol, time);
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

  async run(symbol) {
    const type = 'usd';
    const lastTime = await this.fetchLastTime(symbol, type);
    let insertBeginTime = Date.now();
    let res = false;
    do {
      res = await this.runADay(symbol, type, insertBeginTime);
      await Sleep();
      insertBeginTime -= 86400000;
    } while (res && insertBeginTime > lastTime);
  }
}

module.exports = CoinMarketCapSyncService;
