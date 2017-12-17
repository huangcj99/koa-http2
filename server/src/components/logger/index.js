const log4js = require('koa-log4');
const conf = require('../../conf');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

/**
 * 获取配置logger
 * @return   {[type]}                [description]
 * @datetime 2016-12-08T21:34:04+080
 * @author joe<smallcatcat.joe@gmail.com>
 */
function getLogger() {
  // 生产环境输出到文件, 开发测试输出到 console
  const type = conf.mode === 'production' ? 'access' : 'console';
  const logDir = conf.logs;
  let stats = null;

  //创建 log 文件夹
  try {
    stats = fs.statSync(logDir);
  } catch (e) {
    mkdirp.sync(logDir);
  }

  if (stats && !stats.isDirectory()) {
    fs.mkdirSync(logDir);
  }

  //配置 log4js
  log4js.configure({
    appenders: [{
      type: 'console',
      category: 'console'
    }, {
      type: 'dateFile',
      filename: path.join(conf.logs, 'access.log'),
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      category: 'access',
    }],
    levels: {
      access: 'DEBUG'
    }
  });

  return log4js.getLogger(type);
}

module.exports = getLogger();
module.exports.log4js = log4js;
