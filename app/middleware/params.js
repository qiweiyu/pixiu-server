'use strict';

const REQUIRED = 0;
const TYPE = 1;
const DEFAULT = 2;

module.exports = () => {
  const typeChecker = (value, type) => {
    let res = false;
    if (type.startsWith('regex|')) {
      res = new RegExp(type.substr(type.indexOf('|') + 1)).test(value);
    } else {
      switch (type) {
        case 'string' :
          res = true;
          break;
        case 'name' :
          // todo check name
          res = true;
          break;
        case 'int' :
          res = /^([1-9][0-9]*|0)$/.test(value);
          break;
        case 'float' :
          res = /^[0-9]+.?[0-9]*$/.test(value);
          break;
        case 'bool' :
          res = /^(0|1)$/.test(value);
          break;
        default :
          // todo
          throw `type '${type}' is not defined`;
      }
    }
    return res;
  };
  const typeFormatter = (value, type) => {
    let res;
    if (type.startsWith('regex|')) {
      res = value;
    }
    else {
      switch (type) {
        case 'string' :
        case 'name' :
          res = value;
          break;
        case 'int' :
          res = parseInt(value);
          break;
        case 'float' :
          res = parseFloat(value);
          break;
        case 'bool' :
          res = !!parseInt(value);
          break;
        default :
          res = undefined;
      }
    }
    return res;
  };
  return async function params(ctx, next) {
    if (ctx.request.isApiRequest) {
      const paramsMap = ctx.paramsMap;
      const method = ctx.request.method.toLowerCase();
      const router = ctx.router.match(ctx.request.path, method).path[0];
      if (!router) {
        ctx.throw(501);
      }
      const paramsConfig = paramsMap[router.path];
      if (!paramsConfig) {
        ctx.throw(501);
      }
      const params = {};
      if (router.paramNames) {
        const paramParseRes = new RegExp(router.regexp).exec(ctx.request.path);
        router.paramNames.forEach((item, index) => {
          params[item.name] = paramParseRes[index + 1];
        });
      }
      Object.keys(paramsConfig).forEach(key => {
        let value = null;
        if (router.path.indexOf(`:${key}`) >= 0) {
          value = params[key];
        } else {
          value = ((method === 'post') && ctx.request.body[key]) || ((method === 'get') && ctx.request.query[key]);
        }
        if (paramsConfig[key][REQUIRED]) {
          // required
          if (!value) {
            ctx.throw(400, `${key} is required`);
          }
        } else {
          if (!value) {
            value = paramsConfig[key][DEFAULT];
          }
        }
        if (!typeChecker(value, paramsConfig[key][TYPE])) {
          ctx.throw(400, `${key} is not a valid ${paramsConfig[key][TYPE]}`);
        }
        value = typeFormatter(value, paramsConfig[key][TYPE]);
        ctx.request.params[key] = value;
      });
    }
    await next();
  };
};