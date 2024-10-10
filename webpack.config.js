const path = require('path');

module.exports = {

  entry: {
    'game': './src/frontend/scripts/game.ts',
    'home': './src/frontend/scripts/home.ts',
    'joinRoom': './src/frontend/scripts/joinRoom.ts'
  },

  devtool: 'inline-source-map',

  output: {

    filename: '[name].bundle.js',

    path: path.resolve(__dirname, 'dist'),

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

};