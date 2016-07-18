var path = require('path'),
    fs = require('fs'),
    webpack = require('webpack'),
    argv = require('yargs').argv,
    ngAnnotatePlugin = require('ng-annotate-webpack-plugin'),
    copyWebpackPlugin = require('copy-webpack-plugin');

var configfile = path.join(__dirname, 'package.json');
var configobj  = JSON.parse(fs.readFileSync(configfile, 'utf8'));
argv.env = argv.env === 'production'? 'production':'development';

var outputDirectory = './dist';

var plugins = [
  new copyWebpackPlugin([
    {
      context: 'app',
      from: 'dist',
      to: path.resolve(outputDirectory)
    }
  ]),
  new webpack.DefinePlugin({
    __DEVELOPMENT__: argv.env === 'development',
    __PRODUCTION__: argv.env === 'production',
    __VERSION__: JSON.stringify(configobj.version),
    __BUILD__: JSON.stringify(configobj.build)
  }),
  new webpack.ResolverPlugin([
    new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('package.json', ['main'])
  ]),
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
];

var options = {
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
    loaders: [
      {
        test: /\.css$/,
        loader: 'style!css',
      },
      {
        test: /\.html$/,
        loader: 'ngtemplate!html'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/vnd.ms-fontobject'
      },
      {
        test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/x-font-opentype'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=image/svg+xml'
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        loader: 'file'
      }
    ]
  },
  plugins: plugins,
  externals: {
    fs: '{}',
    jQuery: '{}'
  },
  htmlLoaderConfig: {
    minimize: false
  }
};

if (argv.env === 'development') {
  options.output.pathinfo = true;
  options.devtool = 'eval';
} else {
  options.devtool = 'source-map';
}

module.exports = options;
