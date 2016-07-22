var path = require('path'),
    webpack = require('webpack'),
    NgAnnotatePlugin = require('ng-annotate-webpack-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin');

var outputDirectory = './dist';

module.exports = {
  devtool: 'eval',
  entry: {
    vendor: [
      'angular',
      'angular-route',
      'angular-cookies',
      'angular-animate',
      'angular-ui-bootstrap',
      'angular-loading-bar',
      'angular-growl-v2',
      'angular-sanitize',
      'bootbox',
      'bootstrap',
      'ip-address',
      'jquery'
    ],
    onms_requisitions: [
      './app/app-onms-requisitions.js'
    ],
    onms_quick_add_node: [
      './app/app-onms-quick-add-node.js'
    ]
  },
  output: {
    path: outputDirectory,
    pathinfo: true,
    filename: '[name].bundle.js',
    chunkFilename: '[id].bundle.js'
  },
  resolve: {
    root: [
      path.resolve(__dirname, 'node_modules')
    ]
  },
  module: {
    noParse: /lie\.js$|\/leveldown\/|min\.js$/,
    preLoaders: [
      { test: /\.js$/, loaders: ['eslint'] }
    ],
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.html$/, loader: 'ngtemplate!html' },
      { test: /\.(eot|otf|ttf|woff2?|svg)$/, loader: 'url?limit=10000' },
      { test: /\.(jpe?g|png|gif)$/i, loader: 'file' }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([{
      context: 'app',
      from: 'static',
      to: path.resolve(outputDirectory)
    }]),
    new NgAnnotatePlugin({
      add: true
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      chunks: [ 'onms_requisitions', 'onms_quick_add_node'],
      filename: 'onms_commons.bundle.js'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      chunks: ['vendor', 'commons'],
      filename: 'vendor.bundle.js'
    })
  ]
};
