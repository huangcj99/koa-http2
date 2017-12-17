/**
 * 路由中间件
 * 根据路径读取目录下的所有文件的路由
 *
 * 路由声明为相对路径时，添加对应的目录路径
 * 路由声明为绝对路径时，不做处理
 */


const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

/**
 * 递归获取所有文件路径
 * @param    {[type]}                routesPath [description]
 * @return   {[type]}                [description]
 * @datetime 2016-11-30T11:14:41+080
 * @author joe<smallcatcat.joe@gmail.com>
 */
function walk(routesPath) {
  let list = [];

  routesPath = path.resolve(__dirname, routesPath);

  if (fs.statSync(routesPath).isFile()) {
    list.push(routesPath);
  } else {
    const files = fs.readdirSync(routesPath);
    files.forEach(function (file) {
      list = list.concat(walk(routesPath + '/' + file));
    });
  }
  return list;
}

module.exports = function (routesPath, options = {}) {
  const router = new Router(options);
  const paths = walk(routesPath);

  _.each(paths, function (routes, index) {

    const routesConf = require(routes);
    const dirname = `/${path.dirname(path.relative(routesPath, routes))}`;

    if (!_.isArray(routesConf)) {
      throw Error('route config must be an Array');
    }

    _.each(routesConf, function (route, index) {
      const method = route[0].toLowerCase();
      const args = Array.prototype.slice.call(route, 1);
      const url = args[0];

      if (url === '') {
        args[0] = dirname;
      } else if (!url.startsWith('/')) {
        args[0] = dirname + '/' + url;
      }

      router[method].apply(router, args);
    });

  });

  return router;
};
