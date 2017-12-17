/**
 * 统一的错误处理机制
 * @author joe<smallcatcat.joe@gmail.com>
 */

const {
  JsonError
} = require('../../components/error');


const error = () => {
  return async(ctx, next) => {
    const { path } = ctx;

    try {
      await next();
    } catch (err) {
      let status = err.status || 500;
      let message = err.message || '服务器错误';

      ctx.status = status;

      // api 调用
      if (err instanceof JsonError || path.indexOf('/api/') > -1) {
        if (status == 500) {
          // 触发 koa 统一错误事件，可以打印出详细的错误堆栈 log
          ctx.app.emit('error', err, ctx);
        }

        ctx.body = {
          status,
          message
        };
        return;
      }

      // 根据 status 渲染不同的页面
      switch (status) {
      case 403:
        return ctx.render('../server/static/403', {
          error: err
        });
      case 404:
        return ctx.render('../server/static/404', {
          error: err
        });
      case 500:
        // 触发 koa 统一错误事件，可以打印出详细的错误堆栈 log
        ctx.app.emit('error', err, ctx);
        return ctx.render('../server/static/500', {
          error: err
        });
      default:
        return ctx.render('../server/static/500', {
          error: err
        });
      }
    }
  };
};

module.exports = error;
