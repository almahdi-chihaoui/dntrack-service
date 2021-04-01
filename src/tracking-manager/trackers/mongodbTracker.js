/* eslint-disable no-new-func */
const { MongoClient } = require('mongodb');
const { MessageBroker } = require('../../message-broker');

const { logger } = require('../../utils');

class MongoDBTracker {
  #tracker;

  #ttr;

  #query;

  #uri;

  #messageBroker;

  constructor(connection, query, ttr, messageBrokerConnection) {
    this.#ttr = ttr;
    this.#query = query;
    this.#uri = MongoDBTracker.getUri(connection);
    this.#messageBroker = new MessageBroker(messageBrokerConnection);
  }

  #queryDataBase() {
    logger.info('[mongoDBTracker] : Connecting the MongoDB server..');
    const client = new MongoClient(this.#uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      client.connect()
        .then(() => {
          const db = client.db();

          // DANGER !!
          /* TODO (pinned): specify in the README.md that this is a huge security issue
          and emphasize that the app should be used locally or within the corporate VPN */
          const qb = new Function(this.#query)();

          qb(db)
            .then((res) => {
              this.#messageBroker.sendMessage('test', JSON.stringify(res));
            }).catch((err) => {
              throw err;
            }).finally(() => {
              client.close();
            });
        }).catch((err) => {
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
      /* TODO (pinned): specify in the README.md that this is a huge security issue
      and emphasize that the app should be used locally or within the corporate VPN */
      const qb = new Function(this.#query)();

      // eslint-disable-next-line no-unused-vars
      const queryRes = await qb(db);

      // TODO: Validate queryRes
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
      await this.#messageBroker.init();
      this.#tracker = setInterval(() => {
        this.#queryDataBase();
      }, this.#ttr * 1000);
    } catch (err) {
      logger.error(err);
      throw (err);
    }
  }

  stopTracker() {
    clearInterval(this.#tracker);
    this.#messageBroker.closeChannel();
  }

  static async testConnection(connection) {
    logger.info('[mongoDBTracker] : Testing connection to the MongoDB server..');
    const client = new MongoClient(MongoDBTracker.getUri(connection), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      await client.connect();
      logger.info('[mongoDBTracker] : Connection to the MongoDB server was successful');
    } catch (err) {
      logger.error('[mongoDBTracker] : Something wrong happened while testing the connection: ', err);
      throw err;
    } finally {
      await client.close();
    }
  }

  static getUri(connection) {
    return `${connection.protocol}://${encodeURI(connection.user)}:${encodeURI(connection.password)}@${connection.host}/${encodeURI(connection.database)}?retryWrites=true&w=majority`;
  }
}

module.exports = MongoDBTracker;
