module.exports = () => {
  return {
    // common
    // passport
    MESSAGE_VERIFY_FAIL: {
      code: 20001,
      message: 'Message verify fail',
    },
    // chain
    CHAIN_NOT_EXISTS: {
      code: 30001,
      message: 'Chain not exists',
    },
    CHAIN_ID_EXISTS: {
      code: 30002,
      message: 'Chain id is exists',
    },
    DESC_EXISTS: {
      code: 30003,
      message: 'Description is exists',
    },
    MESSAGE_HEADER_EXISTS: {
      code: 30004,
      message: 'Message header is exists',
    },
    DEFAULT_PORT_EXISTS: {
      code: 30005,
      message: 'Default port is exists',
    },
  };
};
