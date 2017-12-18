const app = require('./app.js');
const commander = require('commander');
const conf = require('./conf');
const modes = {
  development: ['development', 'dev', 'DEV'],
  test: ['test', 'TEST'],
  production: ['production', 'prod', 'PROD']
};

let mode, host, port;

/**
 * 识别服务运行模式
 * @param  {[type]} m [description]
 * @return {[type]}   [description]
 */
function detectMode(m) {
  if (!m) {
    return;
  }

  m = m.toLowerCase();
  for (var key in modes) {
    if (modes[key].indexOf(m) > -1) {
      return key;
    }
  }

  return;
}

// 主函数入口
if (require.main === module) {
  //配置命令行参数
  commander
    .option('-p, --port <number>', 'server port')
    .option('-h, --host <ip>', 'ipv4 address')
    .option('-m, --mode <dev|test|prod>', 'server mode')
    .parse(process.argv);

  console.log('The server is starting: ', (new Date()).toString());
  console.log('...... detecting environment from commander ......');
  console.log('commander.host', commander.host);
  console.log('commander.port', commander.port);
  console.log('commander.mode', commander.mode);

  // 检测 mode
  // 从命令行参数中读取，如果没有就默认设置为开发环境
  if (commander.mode) {
    mode = detectMode(commander.mode);
  }
  // 尝试读取环境变量NODE_ENV
  if (!mode && process.env.NODE_ENV) {
    mode = detectMode(process.env.NODE_ENV);
  }

  // 默认为开发模式
  if (!mode) {
    mode = 'development';
  }
  conf.init({
    mode
  });

  // 端口取用优先级
  // 从启动参数中获取
  if (commander.port) {
    try {
      port = Number(commander.port);
    } catch (e) {
      // logger.warn('commander.port parse error', e);
    }
  }

  // 从环境变量中获取
  if (!port && process.env.PORT) {
    try {
      port = Number(process.env.PORT);
    } catch (e) {
      // logger.warn('process.env.PORT parse error', e);
    }
  }
  // 从配置文件获取
  if (!port && conf.serverPort) {
    port = conf.serverPort;
  }
  // 默认 5000
  if (!port) {
    port = 9000;
  }

  // 指定运行ip地址
  if (commander.host) {
    if (/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(commander.host)) {
      host = commander.host.trim();
    }
  }

  // 将参数放到配置中
  conf.update({
    mode: mode,
    host: host,
    serverPort: port
  });

  // 启动服务器
  app.init();
}
