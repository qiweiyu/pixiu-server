'use strict';

const Service = require('egg').Service;
const TableName = 'chain';

class ChainService extends Service {
  async create(params, address) {
    const conn = await this.app.mysql.beginTransaction();
    try {
      if ((await conn.select(TableName, { where: { chainId: params.chainId } })).length) {
        throw this.ctx.errMap['CHAIN_ID_EXISTS'];
      }
      if ((await conn.select(TableName, { where: { desc: params.description } })).length) {
        throw this.ctx.errMap['DESC_EXISTS'];
      }
      if ((await conn.select(TableName, { where: { msgHeader: params.messageHeader } })).length) {
        throw this.ctx.errMap['MESSAGE_HEADER_EXISTS'];
      }
      if ((await conn.select(TableName, { where: { defaultPort: params.defaultPort } })).length) {
        throw this.ctx.errMap['DEFAULT_PORT_EXISTS'];
      }
      const data = {
        chainId: params.chainId,
        desc: params.description,
        msgHeader: params.messageHeader,
        defaultPort: params.defaultPort,
        detail: JSON.stringify(params),
        createdBy: address,
        createdAt: Math.ceil(Date.now() / 1000),
      };
      const res = await conn.insert(TableName, data);
      await conn.commit();
      return res.insertId;
    } catch (e) {
      await conn.rollback();
      throw e;
    }
  }

  async info(chainId) {
    const chain = await this.fetchByChainId(chainId);
    if (!chain) {
      throw this.ctx.errMap['CHAIN_NOT_EXISTS'];
    }
    return {
      chainId: chain.chainId,
      createdAt: chain.createdAt,
      createdBy: chain.createdBy,
      ...(JSON.parse(chain.detail))
    };
  }

  async fetchByChainId(chainId) {
    return (await this.app.mysql.select(TableName, { where: { chainId } }))[0];
  }

  generateConf(chain) {
    const chainInfo = JSON.parse(chain.detail);
    const confList = [
      'poa=1',
    ];
    const keyMap = {
      tokenName: 'token-name',
      defaultPort: 'default-port',
      messageHeader: 'msgstart',
      description: 'genesis-input',
      initReward: 'subsidy-init',
      halvingInterval: 'subsidy-halving-interval',
      halvingTimes: 'subsidy-halving-time',
      minerList: 'poa-miner-list',
      blockInterval: 'poa-interval',
      blockTimeout: 'poa-timeout',
    };
    for (let key in chainInfo) {
      const v = (chainInfo[key]).toString().trim();
      const confKey = keyMap[key];
      if (confKey) {
        confList.push(`${confKey}=${v}`);
      } else {
        switch (key) {
          case 'dnsSeed':
            if (v) {
              v.split(',').forEach(seed => {
                confList.push(`adddnsseed=${seed.trim()}`);
              });
            }
            break;
          case 'ipSeed':
            if (v) {
              v.split(',').forEach(seed => {
                confList.push(`addnode=${seed.trim()}`);
              });
            }
            break;
        }
      }
    }
    return confList.join(`\n`);
  }

  async getChainDataListWithCondition(start, length, where = {}) {
    return await this.app.mysql.select(TableName, {
      where,
      orders: [['id', 'desc']],
      limit: length,
      offset: start,
    });
  }

  async getChainCountWithCondition(where = {}) {
    const res = await this.app.mysql.select(TableName, { where });
    return res.length;
  }
}

module.exports = ChainService;
