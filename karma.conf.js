module.exports = function(config) {
  var testWebpackConfig = require('./webpack.test.js')();

  var configuration = {

    // base path that will be used to resolve all patterns (e.g. files, exclude)
    basePath: '',

    frameworks: ['jasmine'],
    exclude: [ ],

    files: [
       { pattern: 'tests/spec-bundle.js', watched: false }
    ],

    preprocessors: {
       'tests/spec-bundle.js': ['webpack']
    },

    // webpack setup
    webpack: testWebpackConfig,
    webpackMiddleware: {stats: 'errors-only'},

    reporters: [ 'mocha' ],

    autoWatch: false,

    browsers: [
      // 'Chrome',
      'ChromeHeadless',
    ],

    customLaunchers: {
       ChromeHeadless: {
          base: 'Chrome',
          flags: [
             '--no-sandbox',
             '--headless',
             '--disable-gpu',
             '--remote-debugging-port=9222',
          ],
       }
     },

     singleRun: true
  };

  config.set(configuration);
};
