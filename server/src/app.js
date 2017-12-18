const path = require('path');
const Koa = require('koa');
// const app = new Koa();
const http2 = require('http2');
const debug = require('debug')('koa:application');
const views = require('koa-views');
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
  const error = require('./middleware/error');
  const serveStatic = require('./middleware/static');
  const router = require('./middleware/router');
  const notFound = require('./middleware/not-found');
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

  // views 路径
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
