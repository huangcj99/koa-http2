const request = require('request-promise-native');
const uuid = require('uuid');
const _ = require('lodash');

const conf = require('../../conf');
const logger = require('../../components/logger');

/**
 * 组装 Headers
 * @param    {[type]}                params [description]
 * @datetime 2016-11-08T11:00:12+080
 * @author joe<smallcatcat.joe@gmail.com>
 */
function setHeaders(params, ctx) {
  const headers = {
    'Request-Id': uuid.v4(),
    'X-User-Agent': 'web'
  };

  if (!params) {
    return headers;
  }

  let {
    Range,
    range
  } = params;

  Range = Range || range;

  if (Range) {
    Range = _.isString(Range) ? JSON.parse(Range) : Range;
    const {
      sort,
      page
    } = Range;

    let str = '';
    if (sort) {
      if (_.isArray(sort)) {
        _.each(sort, function (value) {
          const item = `sort=${value.sort},order=${value.order};`;
          str += item;
        });
      } else {
        str += `sort=${sort.sort},order=${sort.order};`;
      }
    }

    str += `page=${page.page},size=${page.size}`;

    params['Range'] = str;
  }

  params = _.pick(params, ['Range']);

  Object.assign(headers, params);

  // 如果有 auth 中间件, 添加 authorization 头部
  if (ctx.token) {
    headers.Authorization = ctx.token;
  }

  return headers;
}

const sendRequest = async(...opts) => {
  let promises, results;
  let _serverRequestStartTime, _serverRequestEndTime, _serverRequestMS;
  let options = [];
  const ctx = opts.shift();

  if (!_.isArray(opts[0])) {
    opts = [opts];
  }

  promises = opts.map((option) => {
    const [url, data, headers] = option;
    const urlArr = url.split('+');

    option = {
      method: (urlArr[0] || 'GET').toUpperCase(),
      uri: urlArr[1],
      headers: setHeaders(headers, ctx),
      json: true,
      timeout: conf.requestTimeout,
    };

    switch (option.method) {
    case 'GET':
    case 'DELETE':
    case 'HEAD':
      option.qs = data || {};
      break;
    case 'POST':
    case 'PUT':
      option.body = data || {};
      break;
    }
    options.push(option);
    return request(option);
  });

  _serverRequestStartTime = process.uptime();
  try {
    results = await Promise.all(promises);

    _serverRequestEndTime = process.uptime();
    _serverRequestMS = _serverRequestEndTime - _serverRequestStartTime;
    logger.info('[request server api] options:' + JSON.stringify(options) + ' response-time: ' + _serverRequestMS.toFixed(3) + 'ms');

    return results.length > 1 ? results : results[0];

  } catch (err) {
    logger.error('[proxy request error][options:', JSON.stringify(options), err.message);

    // 服务端错误统一处理
    err.status = err.statusCode || 500;
    err.message = err.error ? err.error.msg : err.message;

    throw err;
  }
};

module.exports = function (url) {

  return async(ctx, next) => {
    if (url) { // proxy 直接转发请求
      const {
        request,
        headers,
        query,
        params
      } = ctx;

      // 替换 占位符
      url = url.replace(/{([^}]+)}/gi, function (match, key, pos) {
        return params[key];
      });
      const data = Object.assign({}, query, request.body);
      const result = await sendRequest(ctx, url, data, headers);

      ctx.body = result;
      return;
    } else {
      if (ctx.proxy) {
        return await next();
      }

      Object.assign(ctx, {
        proxy: async(...opts) => {
          return await sendRequest(ctx, ...opts);
        }
      });

      await next();
    }
  };
};
