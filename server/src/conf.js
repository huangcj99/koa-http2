const _ = require('lodash');

let conf = require('./conf/conf.base'); // 通用配置文件
const devConf = require('./conf/conf.dev'); // 开发配置文件
const testConf = require('./conf/conf.test'); // 测试配置文件
const prodConf = require('./conf/conf.prod'); // 生产配置文件

/**
 * 初始化配置
 * @param  {object} options 配置选项，可配置项mode,可选值为[development, test, production]
 * @return {null}
 */
function init(options) {
  // 根据不同的模式加载不同的配置
  const mode = options.mode;

  if (mode === 'test') {
    conf = _.extend(conf, testConf);
  } else if (mode === 'production') {
    conf = _.extend(conf, prodConf);
  } else if (mode === 'development') {
    conf = _.extend(conf, devConf);
  }

  // 将配置项 export 出去
  update(conf);
}

/**
 * 更新配置项
 * @param  {object} data 配置参数字典
 * @return {[type]}      [description]
 */
function update(data) {
  _.each(data, function (value, key) {
    module.exports[key] = value;
  });
}

module.exports.init = init;
module.exports.update = update;
