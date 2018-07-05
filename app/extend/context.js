'use strict';

const PARAMS_MAP_NAME = Symbol('Context#paramsMap');
const ParamsMap = require('../../config/params');
const ERROR_MAP_NAME = Symbol('Context#errorMap');
const errorMap = require('../../config/errcode');

module.exports = {
  user: null,
  get paramsMap() {
    if (!this[PARAMS_MAP_NAME]) {
      this[PARAMS_MAP_NAME] = ParamsMap();
    }
    return this[PARAMS_MAP_NAME];
  },
  get errMap() {
    if (!this[ERROR_MAP_NAME]) {
      this[ERROR_MAP_NAME] = errorMap();
    }
    return this[ERROR_MAP_NAME];
  },
};
