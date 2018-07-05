'use strict';

module.exports = () => {
  return async function response(ctx, next) {
    try {
      (ctx.app.config.env === 'local') && ctx.response.set('Access-Control-Allow-Origin', '*');
      await next();
      if (ctx.request.isApiRequest) {
        const body = ctx.body || {};
        if (ctx.response.status === 200) {
          ctx.body = {
            success: true,
            data: body,
          };
        } else {
          ctx.body = {
            success: false,
            err: {
              code: ctx.response.status,
              msg: ctx.response.message,
              data: body,
            },
          };
        }
        ctx.response.status = 200;
        ctx.response.message = 'OK';
      }
    } catch (e) {
      console.log(e);
      if (ctx.request.isApiRequest) {
        ctx.body = {
          success: false,
          err: {
            code: e.code || e.status || 500,
            msg: e.message || 'FAILED',
            data: e.data || ((typeof e === 'string') && e),
          },
        };
        ctx.response.status = 200;
        ctx.response.message = 'OK';
      } else {
        throw e;
      }
    }
  };
};