const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Add proxy configuration for development
  if (config.devServer) {
    config.devServer.proxy = [
      {
        context: ['/api'],
        target: 'http://localhost:3333',
        secure: false,
        changeOrigin: true
      }
    ];
  }
  
  return config;
});