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
    // history
    '/api/history/:coin': {
      coin: [true, 'string'],
      begin: [false, 'int', 0],
      end: [false, 'int', 0],
    },
  };
};
