'use strict'

const bunyan = require('bunyan')
const bunyanFormat = require('bunyan-format')

const applicationContext = {
  appName: 'ShortURL',
  contextPath: 'ShortURL',
  env: process.env.SERVICE_ENV || 'local',
  db: {
    host: process.env.DB_HOST || `https://nintex.documents.azure.com:443/`,
    authKey: process.env.AUTH_KEY || `9qgrTNQ669weXWeD7tekUPhqAOakmxexsXz52ROeEelE3QUV9VhtZMkxFIDCSmLS4vxJzSwA4Hrqi5wdXY7M0A==`,
    database: 'nintexdb',
    collection: 'shorturl'
  },
  serviceOptions: {
    port: 8080,
    address: 'localhost'
  }
}

const options = {
  name: `${(process.env.SERVICE_ENV || 'local')}:${(applicationContext.appName || '')}`,
  src: true,
  stream: bunyanFormat({outputMode: process.env.LOG_OUTPUT_MODE || 'json', levelInString: true}),
  level: process.env.LOGLEVEL || 'debug'
};
applicationContext.logger = bunyan.createLogger(options);

// callback method to setup app object
applicationContext.init = function (app) {
  require('./controllers/setup')(app)
}
global.applicationContext = applicationContext;
