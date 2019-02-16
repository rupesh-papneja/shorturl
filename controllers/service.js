'use strict'

const shortId = require('shortid');
const applicationContext = global.applicationContext;
const db = applicationContext.db.client;

class Service {
  async shorten(req, res, next) {
    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    try {
      let request = req.swagger.params.body.value
      let trimmedUrl = request.url.replace('https://', '').replace('http://', '').replace('www.', '');
      let query = {
        query: 'SELECT * FROM root r WHERE r.url=@url',
        parameters: [{
          name: '@url',
          value: trimmedUrl
        }]
      }
      let items = await db.find(query, { enableCrossPartitionQuery: true });
      if (items && items.length) {
        res.statusCode = 409;
        res.end(JSON.stringify(
          {
            errors: [
              { status: 409, title: 'Conflict', message: `URL already registered found record with id ${items[0].id}` }
            ]
          }, null, 2
        ));
      } else {
        let id = shortId.generate();
        await db.addItem({
          id: id,
          fullURL: request.url,
          url: trimmedUrl
        });
        res.end(JSON.stringify({id: id}, null, 2));
      }
    } catch (e) {
      applicationContext.logger.error(e);
      res.statusCode = 500;
      res.end(JSON.stringify(
        {
          errors: [
            { status: 500, title: 'ServerError', message: e.message || e }
          ]
        }, null, 2
      ));
    }
  }
  async retrieve(req, res, next) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    try {
      let id = req.swagger.params.id.value;
      let query = {
        query: 'SELECT * FROM root r WHERE r.id=@id',
        parameters: [{
          name: '@id',
          value: id
        }]
      }
      let items = await db.find(query);
      if (items && items.length && items.length === 1) {
        res.end(JSON.stringify({url: items[0].fullURL}, null, 2));
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify(
          {
            errors: [
              { status: 404, title: 'NotFound', message: `Record not found for ${id}` }
            ]
          }, null, 2
        ));
      }
    } catch (e) {
      applicationContext.logger.error(e);
      res.statusCode = 500;
      res.end(JSON.stringify(
        {
          errors: [
            { status: 500, title: 'ServerError', message: e.message || e }
          ]
        }, null, 2
      ));
    }
  }
}

module.exports = () => {
  return new Service();
}
