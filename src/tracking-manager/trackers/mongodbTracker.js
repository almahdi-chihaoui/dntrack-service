'use strict'

const amqp = require('amqplib/callback_api');
const { MongoClient } = require('mongodb');

const { logger } = require('../../utils');

class MongoDBTracker {
  #tracker;
  #ttr;
  #query;
  #uri;

  constructor(connection, query, ttr) {
    this.#ttr = ttr;
    this.#query = query

    this.#uri = `${connection.protocol}://${encodeURI(connection.user)}:${encodeURI(connection.password)}@${connection.host}/${encodeURI(connection.database)}?retryWrites=true&w=majority`;
  }


  async #queryDataBase() {
    logger.info('[mongoDBTracker] : Connecting the MongoDB client..');
    const client = new MongoClient(this.#uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      client.connect()
        .then(() => {
          const db = client.db();

          // DANGER !!
          /* TODO (pinned): specify in the README.md that this is a huge security issue and emphasize that the app should be used locally or within the corporate VPN */
          const qb = new Function(this.#query)();

          qb(db)
            .then(res => {
              console.log(res);
            }).catch(err => {
              throw err;
            }).finally(() => {
              client.close();
            })

        }).catch(err => {
          throw err;
        });
    } catch (err) {
      logger.error('[mongoDBTracker] : Something wrong happened while querying the database: ', err);
      throw err;
    }
  }

  async #validateQuery() {
    logger.info('[mongoDBTracker] : Validating query..');
    const client = new MongoClient(this.#uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      await client.connect();
      const db = client.db();

      // DANGER !!
      /* TODO (pinned): specify in the README.md that this is a huge security issue and emphasize that the app should be used locally or within the corporate VPN */
      const qb = new Function(this.#query)();

      const queryRes = await qb(db);

      // TODO: Validate queryRes
      console.log(queryRes);
    } catch (err) {
      logger.error('[mongoDBTracker] : Something wrong happened while testing the connection: ', err);
      throw err;
    } finally {
      await client.close();
    }
  }

  async start() {
    try {
      logger.info(`[mongoDBTracker] : Starting the tracker with a ttr: ${this.#ttr}`);
      await this.#validateQuery();
      this.#tracker = setInterval(() => {
        this.#queryDataBase();
      }, this.#ttr * 1000);
    } catch (err) {
      logger.error(err);
      throw (err);
    }
  }

  async testConnection() {
    logger.info('[mongoDBTracker] : Testing connection to the MongoDB client..');
    const client = new MongoClient(this.#uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      await client.connect();
    } catch (err) {
      logger.error('[mongoDBTracker] : Something wrong happened while testing the connection: ', err);
      throw err;
    } finally {
      await client.close();
    }
  }

  stopTracker() {
    clearInterval(this.#tracker);
  }
}

module.exports = MongoDBTracker;