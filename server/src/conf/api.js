const _ = require('lodash');

/**
 * 后端业务API
 * @type {Object}
 */
const config = {

  /**
   * 基础 API
   * @type {Object}
   */
  baseApi: {

  },

  test: {

  }
};

const fillApiPrefix = (apis, prefix) => {
  if (_.isString(apis)) {
    const apiArr = apis.split(':');
    apis = apiArr[0] + '+' +prefix + apiArr[1];
  } else {
    _.each(apis, function (value, key) {
      apis[key] = fillApiPrefix(value, prefix);
    });
  }

  return apis;
};

const getPrefixConf = (apiPrefix) => {
  const cloneConf = _.cloneDeep(config);

  for (const key in apiPrefix) {
    cloneConf[key] = fillApiPrefix(cloneConf[key], apiPrefix[key]);
  }

  return cloneConf;
};

module.exports = config;
module.exports.getPrefixConf = getPrefixConf;
