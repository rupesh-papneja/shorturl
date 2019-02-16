'use strict'
const test = require('tape');
const supertest = require('supertest');
require('../application');
const applicationContext = global.applicationContext;
const urlsuffix = Date.now();

const request = supertest(`http://${applicationContext.serviceOptions.address}:${applicationContext.serviceOptions.port}`);

(async () => {
  await require('../core/bootstrap')();
  test.onFinish(() => {
    process.exit(0);
  });

  let id = null;

  test('Testing heartbeat endpoint', (t) => {
    request.get('/api/st/heartbeat')
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Test for heartbeat: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing options endpoint', (t) => {
    request.options('/api/st/heartbeat')
      .expect(200)
      .end((err, res) => {
        applicationContext.logger.info(`Test for options: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing options endpoint', (t) => {
    request.options('/api/st')
      .expect(200)
      .end((err, res) => {
        applicationContext.logger.info(`Test for options: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing get invalid short id', (t) => {
    request.get('/api/st/123456')
      .expect(404)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing get invalid short id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing bad request without body', (t) => {
    request.post('/api/st')
      .expect(400)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing bad request without body: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing bad request without body', (t) => {
    request.post('/api/st')
      .set('Content-Type', 'application/json')
      .send({})
      .expect(400)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing bad request without body: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing create', (t) => {
    request.post('/api/st')
      .set('Content-Type', 'application/json')
      .send({
        url: `http://google.com/${urlsuffix}`
      })
      .expect(201)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        id = res.body.id;
        applicationContext.logger.info(`Testing create: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing get by short id', (t) => {
    request.get(`/api/st/${id}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing get by short id: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });

  test('Testing create conflict', (t) => {
    request.post('/api/st')
      .set('x-app-namespace', 'client-x')
      .set('Content-Type', 'application/json')
      .send({
        url: `http://google.com/${urlsuffix}`
      })
      .expect(409)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        applicationContext.logger.info(res.body);
        applicationContext.logger.info(`Testing create conflict: ${err ? 'failed' : 'passed'} `)
        t.error(err, 'Passed')
        t.end()
      });
  });
})();
