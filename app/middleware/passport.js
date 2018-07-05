'use strict';

module.exports = () => {
  return async function passport(ctx, next) {
    let needLogin = false;
    if (!ctx.request.isApiRequest) {
      needLogin = false;
    } else {
      switch (ctx.request.path) {
        case '/api/chain/launch':
          needLogin = true;
          break;
        default:
          needLogin = false;
      }
    }

    if (needLogin) {
      const method = ctx.request.method.toLowerCase();
      const key = 'access-token';
      const token = ((method === 'post') && ctx.request.body[key]) || ((method === 'get') && ctx.request.query[key]);
      await ctx.service.passport.restoreUser(token);
    }
    await next();
  };
};
