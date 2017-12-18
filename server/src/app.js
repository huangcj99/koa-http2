const path = require('path');
const Koa = require('koa');
const http2 = require('http2');
const debug = require('debug')('koa:application');
const views = require('koa-views');
const helmet = require('koa-helmet');
const bodyparser = require('koa-bodyparser');
const fs = require('fs');
const staticType = /\.(eot|svg|ttf|woff|woff2|js|css|png|jpe?g|gif|svg)(\?\S*)?$/;
const keysOptions = {
  key: fs.readFileSync('./src/keys/server.key'),
  cert: fs.readFileSync('./src/keys/server.crt')
};

// 重写Koa的listen方法
class KoaOnhttp2 extends Koa {
  constructor() {
    super()
  }

  listen(...args) {
    debug('listen');

    const server = http2.createServer(
      keysOptions,
      this.callback()
    );
    return server.listen(...args);
  }
}

const app = new KoaOnhttp2();

function init() {
  const conf = require('./conf');
  const serveStatic = require('./middleware/static');
  const error = require('./middleware/error');
  const router = require('./middleware/router');
  const slash = require('./middleware/slash');
  const notFound = require('./middleware/not-found');
  const proxy = require('./middleware/proxy');
  const bigPipe = require('./middleware/bigpipe');
  const hostSite = require('./middleware/host-site');
  const routesPath = path.resolve(__dirname, './routes/');
  const {
    serverPort,
    mode,
    host
  } = conf;
  const serverOptions = [serverPort];
  const logger = require('./components/logger');
  const log4js = logger.log4js;
  const pageRouter = router(routesPath);

  // middlewares
  app.use(bodyparser());

  app.use(helmet());

  // views 路径（ctx挂载render）
  app.use(views(path.resolve(conf.root), {
    extension: 'html',
    map: {
      hbs: 'handlebars',
      html: 'handlebars'
    },
    options:{
      helpers: {
        json: require('./components/hbs-helpers/json'),
        compare: require('./components/hbs-helpers/compare'),
        dataFormat: require('./components/hbs-helpers/date-format')
      }
    }
  }));

  // http logger
  app.use(log4js.koaLogger(logger, {
    level: 'auto',
    format: '":method :url HTTP/:http-version :status" ":referrer" ":user-agent" - :response-time ms'
  }));

  // static
  app.use(serveStatic(conf.root, staticType));

  // trail slash
  app.use(slash());

  // host site
  app.use(hostSite());

  // proxy
  app.use(proxy());

  // bigpipe首屏优化
  app.use(bigPipe());

  // 启用 error handler
  app.use(error());

  // 启用routes
  app.use(pageRouter.routes(), pageRouter.allowedMethods());

  // 启用404
  app.use(notFound());

  // 应用级别 error
  app.on('error', async(err, ctx) => {
    logger.error(err, ctx);
  });

  if (host) {
    serverOptions.push(host);
  }

  serverOptions.push(function () {
    logger.info('Server has started');
    logger.info('[mode:', mode, '] listening on port ', serverPort);
  });

  return app.listen.apply(app, serverOptions);
}

module.exports = app;
module.exports.init = init;
