// Entrypoint for collecting test files for karma to run
//   see: https://github.com/webpack-contrib/karma-webpack
//
var testContext = require.context('.', true, /\.spec\.ts/);
testContext.keys().forEach(testContext);
