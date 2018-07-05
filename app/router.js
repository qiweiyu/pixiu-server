'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  // passport
  router.get('/api/passport/nonce', controller.api.passport.nonce);
  router.post('/api/passport/login', controller.api.passport.login);
  // chain
  router.get(/^\/chain\/([a-z0-9]+)\.conf$/, app.controller.chain.conf);
  router.get('/api/chain/list', controller.api.chain.list);
  router.post('/api/chain/launch', controller.api.chain.launch);
  router.get('/api/chain/info', controller.api.chain.info);
};
