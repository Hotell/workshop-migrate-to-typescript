const { resolve, join } = require('path');
const webpack = require('webpack');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
  root: resolve(__dirname, 'src'),
  dist: resolve(__dirname, 'dist'),
};

const config = env => {
  return {
    entry: resolve(PATHS.root, 'main.tsx'),
    output: {
      filename: 'bundle.js',
      path: PATHS.dist,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    devtool: 'source-map',
    devServer: {
      stats: 'minimal',
      overlay: true,
    },
    module: {
      rules: [
        { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
        // ts
        {
          test: /\.tsx?$/,
          include: /src/,
          use: [
            {
              loader: 'awesome-typescript-loader',
            },
          ],
        },
        // css
        { test: /\.css$/, include: /src/, use: ['style-loader', 'css-loader'] },
      ],
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
    plugins: [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new ProgressBarPlugin(),
      new HtmlWebpackPlugin({
        template: resolve(PATHS.root, 'index.html'),
      }),
    ],
  };
};

module.exports = config;
