/**
 * 404 中间件
 *
 * 抛出404交由错误中间件统一处理
 */

module.exports = function () {
  return async(ctx, next) => {

    if(ctx.status === 404){
      ctx.throw(404, 'not found');
    }
    await next();
  };
};
