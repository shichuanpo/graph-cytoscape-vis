// vue.config.js
module.exports = {
  configureWebpack: config => {
    config.module.rules.push({
      test: /.worker.js$/,
      use: {
        loader: 'worker-loader',
        options: { inline: true, name: 'workerName.[hash].js' }
      }
    })
  },
  parallel: false,
  chainWebpack: config => {
    config.output.globalObject('this')
  }
}