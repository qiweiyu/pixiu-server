module.exports = () => {
  return {
    // api name: {
    //      param1 name : required, type, default
    //      param2 name : required, type, default
    //      ...
    // }
    // passport
    '/api/passport/nonce': {},
    '/api/passport/login': {
      sid: [true, 'string'],
      address: [true, 'string'],
      signedMessage: [true, 'string'],
    },
    // chain
    '/api/chain/list': {
      start: [true, 'int'],
      length: [true, 'int'],
    },
    '/api/chain/launch': {
      chainId: [true, 'string'],
      tokenName: [true, 'string'],
      description: [true, 'string'],
      messageHeader: [true, 'string'],
      minerList: [true, 'string'],
      blockInterval: [true, 'int'],
      blockTimeout: [true, 'int'],
      defaultPort: [true, 'int'],
      dnsSeed: [false, 'string', ''],
      ipSeed: [false, 'string', ''],
      initReward: [true, 'int'],
      halvingInterval: [true, 'int'],
      halvingTimes: [true, 'int'],
    },
    '/api/chain/info': {
      chainId: [true, 'string'],
    },
  };
};
