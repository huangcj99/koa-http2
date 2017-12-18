const path = require('path');
const root = path.resolve(__dirname, '../../../public');

module.exports = {
  root: root,
  serverPort: 9002,
  // 客户端公参接收配置
  client_params_keys: ['caller', 'os', 'ver', 'platform', 'imei', 'mac', 'ch', 'token'],

  // session timeout
  sessionTimeout: 60 * 60 * 24,

  //upload
  upload: {
    dest: path.resolve(__dirname, '../../uploads/'),
    maxSize: 1 * 1024 * 1024
  }
};
