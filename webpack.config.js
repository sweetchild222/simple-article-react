const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

console.log('asdf')

module.exports = {
  
  // 개발 모드 (production으로 설정 시 압축)
  mode: 'development', 
  
  // 애플리케이션 시작점
  entry: './src/index.js',
  
  // 번들링 결과물 위치
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true, // 빌드 시 이전 파일 삭제
  },
}