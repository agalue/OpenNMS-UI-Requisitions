var path = require('path'),
    webpack = require('webpack'),
    ngAnnotatePlugin = require('ng-annotate-webpack-plugin'),
    copyWebpackPlugin = require('copy-webpack-plugin');

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
      './app/app.js'
    ]
  },
  output: {
    path: outputDirectory,
    pathinfo: true,
    filename: '[name].bundle.js',
    chunkFilename: '[chunkhash].bundle.js'
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
      { test: /\.html$/, loader: 'ngtemplate!html?config=htmlLoaderConfig' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/vnd.ms-fontobject' },
      { test: /\.otf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/x-font-opentype' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
      { test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' },
      { test: /\.(jpe?g|png|gif)$/i, loader: 'file' }
    ]
  },
  plugins: [
    new copyWebpackPlugin([{
      context: 'app',
      from: 'dist',
      to: path.resolve(outputDirectory)
    }]),
    new ngAnnotatePlugin({
      add: true
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.js',
      minChunks: Infinity
    }),
    new webpack.optimize.CommonsChunkPlugin({
      children: true,
      async: true
    })
  ],
  externals: {
    fs: '{}',
    jQuery: '{}'
  },
  htmlLoaderConfig: {
    minimize: false
  }
};
