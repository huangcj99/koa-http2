/**
 * host 中间件
 * 根据 url 获取当前是 host 那个网站,
 *
 * 添加 hostSite 属性到 ctx 上
 */

module.exports = function () {
  return async(ctx, next) => {
    const url = ctx.url.split('/');

    ctx.hostSite = url[1] === 'api' ? url[2] : url[1];

    await next();
  };
};
