var webpack = require('webpack');
var path = require('path');

/**
 * This is the Webpack configuration file for local development.
 * For more information, see: http://webpack.github.io/docs/configuration.html
 */

module.exports = {

  entry: {
    background: './src/background',
    content: './src/content',
    vendors: ['react', 'react-dom']
  },

  output: {
    path: path.join(__dirname, 'chrome/'),
    filename: '[name]-bundle.js'
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
    new webpack.NoErrorsPlugin()
  ],

  // Transform source code using Babel
  module: {
    include: [
      path.resolve(__dirname, 'src')
    ],

    preLoaders: [
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules|vendor/,
      //   loader: 'eslint-loader'
      // }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules|vendor/,
        loader: 'babel'
      }
    ]
  },

  // Automatically transform files with these extensions
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};
