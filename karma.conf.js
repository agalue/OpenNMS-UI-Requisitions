var webpackConfig = require('./webpack.config.js');
webpackConfig.entry = {};
webpackConfig.output = {};

module.exports = function (config) {
  config.set({
    basePath: __dirname,

    frameworks: [
      'jasmine'
    ],

    reporters: [
      'progress',
    ],

    files: [
      './app/app-onms-requisitions.js',
      './node_modules/angular-mocks/angular-mocks.js',
      './test/spec/**/*.js'
    ],

    preprocessors: {
      './app/app-onms-requisitions.js': ['webpack'],
      './test/spec/**/*.js': ['webpack']
    },

    browsers: [
      'PhantomJS'
    ],

    singleRun: true,

    webpack: webpackConfig
  });
};
