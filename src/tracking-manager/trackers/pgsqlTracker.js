'use strict'

const amqp = require('amqplib/callback_api');
const {Client, Pool} = require('pg');

const { logger } = require('../../utils');

class PgsqlTracker {
  #connection;
  #tracker;
  #ttr;
  #query;

  constructor(connection, query, ttr) {
    this.#connection = connection;
    this.#ttr = ttr;
    this.#query = query;
  }

  #queryDataBase(connection, query) {
    logger.info('[pgsqlTracker] : Connecting to the PostgreSQL server..');
    const client = new Client(connection);

    try {
      client.connect();

      // Execute the query asynchronously
      client.query(query)
        .then(res => {
          console.log(res.rows);
          // TODO send results to rabbitmq server
        })
        .catch(err => {
          logger.error('[pgsqlTracker] : Error executing query', err);
          logger.info('[pgsqlTracker] : Stopping the tracker..')
          this.stopTracker();
        })
        .finally(() => {
          client.end();
        })

    } catch (err) {
      logger.error('[pgsqlTracker] : Something wrong happened while validating the query: ', err);
      throw err;
    }
  }

  async #validateQuery(connection, query) {
    logger.info('[pgsqlTracker] : Validating query..');
    const client = new Client(connection);

    try {
      await client.connect();

      // Execute the query
      const queryRes = await client.query(query);

      // TODO: Validate queryRes
      console.log(queryRes.rows);
    } catch (err) {
      logger.error('[pgsqlTracker] : Something wrong happened while validating the query: ', err);
      throw err;
    } finally {
      await client.end();
    }
  }

  async start() {
    try {
      logger.info(`[pgsqlTracker] : Starting the tracker with a ttr: ${this.#ttr}`);
      await this.#validateQuery(this.#connection, this.#query);
      this.#queryDataBase(this.#connection, this.#query);
      this.#tracker = setInterval(() => {
        this.#queryDataBase(this.#connection, this.#query);
      }, this.#ttr * 1000);
    } catch (err) {
      logger.error(err);
      throw(err);
    }
  }

  stopTracker() {
    clearInterval(this.#tracker);
  }

  static async testConnection(connection) {
    const client = new Client(connection);
    try {
      logger.info('[pgsqlTracker] : Testing connection to the PostgreSQL server..');
      await client.connect();
      logger.info('[pgsqlTracker] : Connection to the PostgreSQL server was successful');

    } catch (err) {
      logger.error('[pgsqlTracker] : Something wrong happened while testing the connection: ', err);
      throw err;
    } finally {
      await client.end();
    }
  }
}

module.exports = PgsqlTracker;