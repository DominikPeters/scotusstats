const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    chunkFilename: '[name].bundle.js', 
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
        { from: 'src/embed', to: 'embed' },
        { from: 'src/charts', to: 'embed/charts' },
        { from: 'src/embed/chartFooter.js', to: 'embed/charts/chartFooter.js' },
        { from: 'src/utils.js', to: 'embed/utils.js' },
        { from: 'src/utils.js', to: 'embed/charts/utils.js' },
        { from: 'src/favicon.svg', to: 'favicon.svg' },
        { from: 'src/podcast', to: 'podcast' },
        { from: 'src/videos', to: 'videos' },
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
      {
        directory: path.join(__dirname, 'src', 'embed'),
        publicPath: '/embed',
      },
    ],
    compress: true,
    port: 9000,
    open: false
  },
  devtool: 'source-map',
};
