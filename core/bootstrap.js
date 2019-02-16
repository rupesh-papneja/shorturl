'use strict'
/**
 * Bootstrap file
 */
const http = require('http');
const applicationContext = global.applicationContext;
const db = require('../db')();
class Server {
  start(service) {
    this.service = require('./service')();
    http.createServer(this.service).listen(applicationContext.serviceOptions.port, () => {
      applicationContext.logger.info('Server listening on http://%s:%d', applicationContext.serviceOptions.address, applicationContext.serviceOptions.port);
    })
  }
}

module.exports = async () => {
  let t = new Server();
  try {
    await db.init(); // making sure table exists before application starts up
    applicationContext.db.client = db; // setting db to global application context
    t.start();
    return t;
  } catch (e) {
    applicationContext.logger.error(e);
    process.exit(1);
  }
}
