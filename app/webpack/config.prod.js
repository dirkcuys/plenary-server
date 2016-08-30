"use strict";

var path = require('path');
var webpack = require('webpack');
var BundleTracker = require("webpack-bundle-tracker");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');
var normalize = require("postcss-normalize");

var root = path.join(__dirname, '..');

module.exports = {
  devtool: 'eval',
  entry: {
    'main': [
      path.join(root, 'client', 'index.scss'),
      path.join(root, 'client', 'index.js'),
    ]
  },
  output: {
    path: path.join(root, 'build'),
    filename: '[name]-[hash].js',
    publicPath: '/build/'
  },
  plugins: [
    new BundleTracker({
      path: path.join(root, 'build'),
      filename: 'webpack-stats.json'
    }),
    new ExtractTextPlugin('[name]-[hash].css'),
  ],
  module: {
    loaders: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader!sass-loader')
      },
      {
        test: /\.css/,
        loader: 'style-loader!css-loader!postcss-lodaer'
      },
      {test: /\.woff2?(\?v=.*)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
      {test: /\.ttf(\?v=.*)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
      {test: /\.eot(\?v=.*)?$/, loader: "file" },
      {test: /\.svg(\?v=.*)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" },
      {test: /\.otf(\?v=.*)?$/, loader: "url?limit=10000&mimetype=application/font-sfnt" },
    ]
  },
  postcss: function() {
    return [autoprefixer, normalize];
  }
}

