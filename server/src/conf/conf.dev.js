const _ = require('lodash');
const path = require('path');
const apiConf = require('./api');

const apiPrefix = {
  test: ''
};

const config = {
  // 请求超时配置
  requestTimeout: 10000,

  // 默认服务端口
  serverPort: 9001,

  // logs 存储位置
  logs: path.resolve(__dirname, '../../logs/')
};

_.extend(config, apiConf.getPrefixConf(apiPrefix));

module.exports = config;
