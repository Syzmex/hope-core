
export default {
  port: 8000,
  proxy: {
    '/cui/do/*': {
      target: 'http://192.168.1.3',
      changeOrigin: true
    }
  }
  // webpackConfig: {
  //   dev: 'webpack.config.dev.js',
  //   dll: 'webpack.config.dll.js',
  //   prod: 'webpack.config.prod.js'
  // }
};
