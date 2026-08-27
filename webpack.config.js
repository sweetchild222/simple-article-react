import path, { dirname } from 'path'

import { fileURLToPath } from 'url';
import HTMLWebpackPlugin from 'html-webpack-plugin'
import  CopyWebpackPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';
import dotenv from 'dotenv'
import InterpolateHtmlPlugin from 'interpolate-html-plugin';

const publicUrl = '';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config()

const HTMLWebpackPlug = new HTMLWebpackPlugin({
  template: path.resolve(__dirname, './public/index.html'),
  filename: 'index.html',
  inject: 'body'
})

const InterpolateHtmlPlug = new InterpolateHtmlPlugin({PUBLIC_URL: publicUrl})

const ProcessEnvPlug = new webpack.DefinePlugin({'process.env':JSON.stringify(process.env)})

const CopyPlug = new CopyWebpackPlugin(
  {patterns: 
    [
      { 
        from: path.resolve(__dirname, 'public'),
        to: path.resolve(__dirname, 'react_dist'),
        globOptions: {
          ignore: ['**/index.html'],
        },
      },
    ],
  })


export default {

  entry: path.join(__dirname, 'src/page/entry/Entry.js'),

  output: {
    filename: 'main.js',
    path: path.join(__dirname, 'react_dist'),
    clean: true,
    publicPath: '/'
  },

  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      '@util': path.resolve(__dirname, 'src/lib/util'),
      '@rest': path.resolve(__dirname, 'src/lib/rest'),
      '@gui': path.resolve(__dirname, 'src/lib/gui'),
      '@page': path.resolve(__dirname, 'src/page'),
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


  plugins: [HTMLWebpackPlug, InterpolateHtmlPlug, ProcessEnvPlug, CopyPlug],
  
  devServer: {    
    port:3001,
    open: true,
    hot: true,
    // webSocketServer: true,
    historyApiFallback:true,
    proxy: [
      {
        context: ['/api'],        
        target: process.env.API_TARGET,
        changeOrigin: true,
        secure: false
      },      
    ]
  }
}