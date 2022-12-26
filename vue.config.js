const fs = require('fs')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');


module.exports = {
    // ...

    configureWebpack: {
      plugins: [new NodePolyfillPlugin()]
    },


    
    devServer: {
      host: 'dev.daten-oase.org',

      port: 8080, // CHANGE YOUR PORT HERE!

     
      https: {
        key: fs.readFileSync('./hidden/certificates/key.pem'),
        cert: fs.readFileSync('./hidden/certificates/certificate.pem'),
      },

      proxy: {
        '^(?!/ws)': {
          target: 'https://dev.daten-oase.org',
          changeOrigin: true
        },
      }
    },
    // ...
  }