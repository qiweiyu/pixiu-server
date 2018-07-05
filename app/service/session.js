'use strict';

const Service = require('egg').Service;
const UuidV4 = require('uuid/v4');
const TableName = 'session_data';

class SessionService extends Service {
  async get(id) {
    id = id.toString();
    await this.app.mysql.query(`delete from ${TableName} where expired < ${Date.now()}`);
    return await this.app.mysql.get(TableName, { id });
  }

  async set(id, token, maxAge = 30 * 86400 * 1000) {
    id = id.toString();
    const data = {
      id,
      token,
      expired: Date.now() + maxAge,
    };
    if (await this.get(id)) {
      return await this.app.mysql.update(TableName, data);
    } else {
      return await this.app.mysql.insert(TableName, data);
    }
  }

  async refresh(id) {
    id = id.toString();
    return await this.app.mysql.update(TableName, { id, expired: Date.now() + 30 * 86400 * 1000 });
  }

  generateToken() {
    return UuidV4();
  }
}

module.exports = SessionService;
