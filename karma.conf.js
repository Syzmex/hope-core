module.exports = function ( config ) {
  config.set({
    basePath: '',
    frameworks: [ 'jasmine-ajax', 'jasmine' ],
    files: [
      require.resolve( 'babel-polyfill/dist/polyfill.min.js' ),
      'test/**/*.js'
    ],
    exclude: [],
    preprocessors: {
      'test/**/*.js': ['webpack']
    },
    reporters: ['mocha'],
    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false,
    concurrency: Infinity,
    webpack: {
      module: {
        loaders: [{
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            babelrc: false,
            presets: [
              [ require.resolve( 'babel-preset-es2015' ), { modules: false }],
              require.resolve( 'babel-preset-stage-0' )
            ],
            plugins: [
              require.resolve( 'babel-plugin-transform-es2015-modules-umd' ),
              require.resolve( 'babel-plugin-istanbul' )
            ],
            cacheDirectory: true
          }
        }]
      }
    }
  });
};
