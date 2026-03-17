const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');

const publicUrl = '';

const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  template: path.resolve(__dirname, './public/index.html'),
  filename: 'index.html',
  inject: 'body'  
})

module.exports = {
  entry: path.join(__dirname, 'src/index.js'),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, '/build')    
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!()\/).*/,
        use: {
          loader: 'babel-loader',
          options: {"presets": [["@babel/preset-react", {"runtime": "automatic"}]]},
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ],
  },
  plugins: [HTMLWebpackPluginConfig, new InterpolateHtmlPlugin({PUBLIC_URL: publicUrl})],

  devServer: {
    port:3000,
    open: true,
    historyApiFallback: true,
    hot: true,
    overlay: true,
  }
}