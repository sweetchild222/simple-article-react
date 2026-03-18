import path, { dirname } from 'path'
import { fileURLToPath } from 'url';
import HTMLWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from  'mini-css-extract-plugin';
import webpack from 'webpack';
import InterpolateHtmlPlugin from 'interpolate-html-plugin';

const publicUrl = '';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  template: path.resolve(__dirname, './public/index.html'),
  filename: 'index.html',
  inject: 'body'  
})

const InterpolateHtmlPluginConfig = new InterpolateHtmlPlugin({PUBLIC_URL: publicUrl})

export default {

  entry: path.join(__dirname, 'src/page/entry/index.js'),

  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, '/build'),
    clean: true,
    publicPath: '/'
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

  plugins: [HTMLWebpackPluginConfig, InterpolateHtmlPluginConfig],
  
  devServer: {    
    port:3001,
    open: true,
    hot: true,    
    historyApiFallback:true,
    // historyApiFallback: {
    //   index: '/index.html',
    //   verbose: true,
    //   rewrites: [
    //     { from: /./, to: '/index.html'}, // Rewrites all paths to index.html
    //     { from: /./, to: '/index.html'}, // Rewrites all paths to index.html
    //   ]
    // },    
    proxy: [
      {
        context: ['/api'],
        target: 'http://13.124.193.201:8080',
        // target: 'http://localhost:9981',
        changeOrigin: true,
        secure: false
      },      
    ]
  }
}