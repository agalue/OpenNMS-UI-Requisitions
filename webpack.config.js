var path = require('path'),
    fs = require('fs'),
    webpack = require('webpack'),
    argv = require('yargs').argv,
    ngAnnotatePlugin = require('ng-annotate-webpack-plugin'),
    copyWebpackPlugin = require('copy-webpack-plugin');

var configfile = path.join(__dirname, 'package.json');
var configobj  = JSON.parse(fs.readFileSync(configfile, 'utf8'));
argv.env = argv.env === 'production'? 'production':'development';

/* eslint-disable no-console */
console.log(configobj.name + ' v' + configobj.version + ' (build ' + configobj.build + ')');
/* eslint-enable no-console */

var outputDirectory = './dist';

var plugins = [
  new copyWebpackPlugin([
    {
      context: 'app',
      from: 'index.html',
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

if (argv.env !== 'development') {
  plugins.push(new webpack.optimize.OccurenceOrderPlugin(true));
  plugins.push(new webpack.optimize.DedupePlugin());
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    mangle: {
      except: [ '$super', '$', 'jQuery', 'exports', 'require', 'angular' ]
    }
  }));
}

var options = {
  entry: {
    vendor: [
      'angular-route',
      'angular-cookies',
      'angular-ui-bootstrap',
      'angular-loading-bar',
      'angular-growl-v2',
      'ip-address',
      'bootbox'
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
    /*
    preLoaders: [
      {
        test: /\.js$/,
        loaders: ['eslint']
      }
    ],
    */
    loaders: [
      {
        test: /\.css$/,
        loader: 'style!css',
      },
      {
        test: /\.html$/,
        loader: 'ngtemplate!html?config=htmlLoaderConfig'
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
