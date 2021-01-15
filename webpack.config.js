const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(env) {
    const STAGE = env.STAGE || 'dev';
    const MODE = STAGE === 'prod' || STAGE === 'demo'  ? 'production' : 'development';

    return {
        mode: MODE,
        entry: {
            verification: './verification/index.ts'
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js'
        },
        module: {
            rules: [
                { test: /\.ts?$/, use: 'ts-loader', exclude: /node_modules/ },
                { test: /\.s[ac]ss$/i, use: ['style-loader', 'css-loader', 'sass-loader'] },
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
                chunks: ['verification'],
                filename: 'verification.html',
                template: './verification/index.html'
            }),
            new webpack.NormalModuleReplacementPlugin(/(.*)environment.dev(\.*)/, function(resource) {
              resource.request = resource.request.replace(/environment.dev/, `environment.${STAGE}`);
            }),
            new CleanWebpackPlugin(),
        ],
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            port: 9102
        }
    }
};
