'use strict';

const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const controller = require('./service')();
const applicationContext = global.applicationContext;

class Service {
  constructor (app) {
    this.app = app;
  }
  setup () {
    const self = this;
    // swaggerRouter configuration
    const options = {
      controllers: {
        heartbeat: async (req, res, next) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'server running', version: '0.0.1' }));
        },
        shorten: async (req, res, next) => {
          controller.shorten(req, res, next);
        },
        retrieve: async (req, res, next) => {
          controller.retrieve(req, res, next);
        }
      }
    };

    const spec = fs.readFileSync(path.join(__dirname, '/../api/swagger.yaml'), 'utf8')
    const swaggerDoc = jsyaml.safeLoad(spec)
    fs.writeFile(path.join(__dirname, '/../api/swagger.json'),
      JSON.stringify(swaggerDoc, null, 2), (err) => {
        if (err) {
          applicationContext.logger.error('Error occurred while writing yml file')
        }
      });
    swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
      self.app.use(middleware.swaggerMetadata());
      self.app.use(middleware.swaggerValidator({validateResponse: true}));
      self.app.use(middleware.swaggerRouter(options))
      self.app.use(middleware.swaggerUi(swaggerDoc, {
        apiDocs: `/api-docs`,
        swaggerUi: `/docs`,
        swaggerUiDir: __dirname.concat('/../core/dist')}
      ))
      self.app.use((err, req, res, next) => {
        applicationContext.logger.error(req.context, err);
        res.setHeader('Content-Type', 'application/json');
        if (err.code === 'SCHEMA_VALIDATION_FAILED') {
          res.statusCode = 400
        } else {
          res.statusCode = 500
        }
        res.end(JSON.stringify({
          errors: [err]
        }))
      })
    });
  }
}

module.exports = (app) => {
  const s = new Service(app);
  s.setup();
  return s;
}
