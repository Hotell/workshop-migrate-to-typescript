const { resolve, join } = require('path')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const PATHS = {
  root: resolve(__dirname, 'src'),
  dist: resolve(__dirname, 'dist'),
}

const config = env => {
  return {
    entry: resolve(PATHS.root, 'main.jsx'),
    output: {
      filename: 'bundle.js',
      path: PATHS.dist,
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    devtool: 'source-map',
    devServer: {
      stats: 'minimal',
      overlay: true,
    },
    module: {
      rules: [
        // js
        { test: /\.jsx?$/, include: /src/, use: { loader: 'babel-loader' } },
        // css
        { test: /\.css$/, include: /src/, use: ['style-loader', 'css-loader'] },
      ],
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
    plugins: [
      new ProgressBarPlugin(),
      new HtmlWebpackPlugin({
        template: resolve(PATHS.root, 'index.html'),
      }),
    ],
  }
}

module.exports = config
