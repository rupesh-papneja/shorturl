'use strict'

const CosmosClient = require('@azure/cosmos').CosmosClient;
const applicationContext = global.applicationContext;
const client = new CosmosClient({ endpoint: applicationContext.db.host, auth: { masterKey: applicationContext.db.authKey } });

class DAO {
  async init() {
    try {
      const dbResponse = await client.databases.createIfNotExists({ id: applicationContext.db.database });
      this.database = dbResponse.database;
      const coResponse = await this.database.containers.createIfNotExists({ id: applicationContext.db.collection });
      this.container = coResponse.container;
    } catch (err) {
      throw err;
    }
  }
  async find(querySpec, options) {
    try {
      let results = await this.container.items.query(querySpec, options).toArray();
      return results.result;
    } catch (err) {
      throw err;
    }
  }

  async addItem(item) {
    try {
      const result = await this.container.items.create(item);
      return result;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = () => {
  const d = new DAO();
  return d;
}
