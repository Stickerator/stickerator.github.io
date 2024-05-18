const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      https: require.resolve('https-browserify'),
      path: require.resolve('path-browserify'),
      url: require.resolve('url'),
      fs: false,
      'fs/promises': false,
      child_process: false,
      os: false,
    },
  },
  // Other configurations (entry, output, module rules, plugins, etc.)
};
