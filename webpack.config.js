const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = function (env) {
  const STAGE = env.STAGE || 'dev';
  const MODE = STAGE === 'prod' ? 'production' : 'development';

  return {
    mode: MODE,
    entry: {
      verification: './verification.ts'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js'
    },
    module: {
      rules: [
        {test: /\.ts?$/, use: 'ts-loader', exclude: /node_modules/},
        {test: /\.css$/i, use: ['style-loader', 'css-loader']},
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
              },
            },
          ],
        },
      ]
    },
    resolve: {
      extensions: ['.js', '.ts']
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './index.html'
      }),
      new HtmlWebpackPlugin({
        filename: 'json-hash-verification.html',
        template: './json-hash-verification.html'
      }),
      new HtmlWebpackPlugin({
        filename: 'form-verification.html',
        template: './form-verification.html'
      }),
      new CleanWebpackPlugin(),
    ],
    devServer: {
      static: path.join(__dirname, 'dist'),
      compress: true,
      port: 9102
    },
    performance: {
      hints: false,
    }
  }
};
