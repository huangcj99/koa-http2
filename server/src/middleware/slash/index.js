/**
 * slash中间件
 * 去掉 url 末尾的 /
 */

module.exports = function () {
  return async(ctx, next) => {
    const redirectUrl = ctx.url
      .replace(/(\/+)/g, '/') // collapse repeated slashes
      .replace(/\/((?:\?.*)?)$/, '$1') // remove trailing slash while preserving querystring
      .replace(/^([^\/]|$)/, '/$1'); // ensure url starts with a slash
    if (ctx.url !== redirectUrl && ctx.url !== '/') {
      ctx.redirect(redirectUrl);
      return;
    }
    await next();
  };
};
