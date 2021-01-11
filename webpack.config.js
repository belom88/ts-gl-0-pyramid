const defaultConfig = require('./webpack.config.default');

const config = {
  mode: 'production',
};

module.exports = {
  ...defaultConfig,
  ...config,
};
