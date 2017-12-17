const util = require('util');

/**
 * 处理 json error
 * @param    {[type]}                message [description]
 * @datetime 2016-11-09T11:10:02+080
 * @author joe<smallcatcat.joe@gmail.com>
 */
function JsonError(message) {
  this.message = message || '';
  this.name = 'JsonError';
}

util.inherits(JsonError, Error);

/**
 * 处理 page error
 * @param    {[type]}                message [description]
 * @datetime 2016-11-09T11:11:23+080
 * @author joe<smallcatcat.joe@gmail.com>
 */
function PageError(message) {
  this.message = message || '';
  this.name = 'PageError';
}

util.inherits(PageError, Error);

module.exports.JsonError = JsonError;
module.exports.PageError = PageError;
