'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  // passport
  router.post('/api/passport/login', controller.api.passport.login);
  // history
  router.get('/api/history/:coin', controller.api.history.list);
};
