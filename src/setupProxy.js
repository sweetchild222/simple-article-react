const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://13.124.193.201:8080/api',      
      changeOrigin: true
    })
  )

  app.use(
    '/blob',
    createProxyMiddleware({
      target: 'http://13.124.193.201:8080/api/blob',
      // target: 'http://127.0.0.1:9981',
      changeOrigin: true
    })
  )
}


// module.exports = function(app) {
//   app.use(
//     '/api',
//     createProxyMiddleware({
//       // target: 'http://13.124.193.201:8080/api',
//       target: 'http://127.0.0.1:9981',
//       changeOrigin: true
//     })
//   )

//   app.use(
//     '/blob',
//     createProxyMiddleware({
//       target: 'http://13.124.193.201:8080/api/blob',
//       // target: 'http://127.0.0.1:9981',
//       changeOrigin: true
//     })
//   )
// }