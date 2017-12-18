const request = require('request-promise-native');
const uuid = require('node-uuid');
const _ = require('lodash');

const conf = require('../../conf');
const logger = require('../logger');

/**
 * 组装 Headers
 * @param    {[type]}                params [description]
 * @datetime 2016-11-08T11:00:12+080
 * @author joe<smallcatcat.joe@gmail.com>
 */
function setHeaders(params) {
  const headers = Object.assign({}, params, {
    'Request-Id': uuid.v4(),
    'X-User-Agent': 'web'
  });

  if (!params) {
    return headers;
  }

  let {
    Range,
    range
  } = params;

  if (Range || range) {
    Range = Range || range;
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

    headers['Range'] = str;
  }

  return headers;
}

/**
 * request 方法
 *
 * 可通过将参数组装成数组方式并行多个请求
 * @param    {[type]}                method    [description]
 * @param    {[type]}                url       [description]
 * @param    {Object}                data [description]
 * @param    {[type]}                headers    [description]
 * @datetime 2016-11-08T11:00:33+080
 * @author joe<smallcatcat.joe@gmail.com>
 */
module.exports = {
  request: async(...opts) => {
    let promises, results;
    let _serverRequestStartTime, _serverRequestEndTime, _serverRequestMS;
    let options = [];

    if (!_.isArray(opts[0])) {
      opts = [opts];
    }

    promises = opts.map((option) => {
      const [url, data, headers] = option;
      const urlArr = url.split('+');

      option = {
        method: (urlArr[0] || 'GET').toUpperCase(),
        uri: urlArr[1],
        headers: setHeaders(headers),
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
  }
};
