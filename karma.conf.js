var webpackConfig = require('./webpack.config.js');
webpackConfig.entry = {};
// Disabling CommonsChunkPlugin
webpackConfig.plugins.pop();
webpackConfig.plugins.pop();

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
      './app/app.js',
      './test/spec/**/*.js'
    ],

    preprocessors: {
      './app/app.js': ['webpack'],
      './test/spec/**/*.js': ['webpack']
    },

    browsers: [
      'PhantomJS'
    ],

    singleRun: true,

    webpack: webpackConfig
  });
};
