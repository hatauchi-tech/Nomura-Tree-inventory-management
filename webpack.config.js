const path = require('path');
const GasPlugin = require('gas-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/server/index.ts',
  output: {
    filename: 'Code.js',
    path: path.resolve(__dirname, 'dist/gas'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.build.json',
          },
        },
        exclude: [/node_modules/, /tests/],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@server': path.resolve(__dirname, 'src/server'),
      '@client': path.resolve(__dirname, 'src/client'),
    },
  },
  plugins: [
    new GasPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'appsscript.json', to: '.' },
        { from: 'src/client/*.html', to: '[name][ext]' },
      ],
    }),
  ],
  optimization: {
    minimize: false,
  },
};
