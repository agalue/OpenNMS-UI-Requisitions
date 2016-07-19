var webpackConfig = require('./webpack.config.js');
webpackConfig.entry = {};
webpackConfig.output = {};
// Disabling CommonsChunkPlugin to avoid issues with Karma
webpackConfig.plugins.pop();

module.exports = function (config) {
  config.set({

    plugins: [
      require('karma-webpack'),
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-phantomjs-launcher'),
      require('karma-ng-html2js-preprocessor'),
      require('karma-ng-scenario')
    ],

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
