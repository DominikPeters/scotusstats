const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/data', to: 'data' },
        { from: 'src/styles', to: 'styles' },
        { from: 'src/img', to: 'img' },
      ],
    }),
  ],
  devServer: {
    static: [
      {
        directory: path.join(__dirname, 'dist'),
      },
      {
        directory: path.join(__dirname, 'src', 'data'),
        publicPath: '/data',
      },
      {
        directory: path.join(__dirname, 'src', 'styles'),
        publicPath: '/styles',
      },
      {
        directory: path.join(__dirname, 'src', 'img'),
        publicPath: '/img',
      },
    ],
    compress: true,
    port: 9000,
    open: false
  },
  devtool: 'source-map',
};
