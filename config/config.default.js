'use strict';

module.exports = appInfo => {
  const config = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1527146349011_7734';

  // add your config here
  config.middleware = [
    'response',
    'passport',
    'params',
  ];

  config.security = {
    csrf: {
      enable: false,
    },
  };
  return config;
};
