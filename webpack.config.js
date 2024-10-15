const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    'game': ['webpack-hot-middleware/client', './src/frontend/scripts/game.ts'],
    'home': ['webpack-hot-middleware/client', './src/frontend/scripts/home.ts'],
    'joinRoom': ['webpack-hot-middleware/client', './src/frontend/scripts/joinRoom.ts']
  },
  devtool: 'inline-source-map',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
};