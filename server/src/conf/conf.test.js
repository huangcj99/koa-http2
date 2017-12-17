const _ = require('lodash');
const apiConf = require('./api');

const apiPrefix = {

};

const config = {
  // 请求超时配置
  requestTimeout: 10000,

  // 默认服务端口
  serverPort: 9001,

  // logs 存储位置
  logs: ''
};

_.extend(config, apiConf.getPrefixConf(apiPrefix));

module.exports = config;
