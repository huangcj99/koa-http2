/**
 * 静态资源 server
 * 根据 pathname 正则匹配来决定哪些请求返回静态资源
 */

const path = require('path');
const send = require('koa-send');
const typeOf = require('kind-of');

module.exports = function serveStatic(dir, pathname, opts) {
  opts = typeOf(opts) === 'object' ? opts : {};
  opts.root = dir;
  pathname = pathname || '/';


  if (typeOf(pathname) === 'string') {
    pathname = pathname[0] === '^' ? pathname.slice(1) : pathname;
    pathname = pathname[0] === '/' ? pathname : '/' + pathname;
    pathname = new RegExp('^' + pathname);
  }

  return async(ctx, next) => {
    if (pathname.test(ctx.url)) {
      const fPath = path.resolve(dir, ctx.path);
      return send(ctx, fPath, opts);
    } else {
      await next();
    }
  };
};
