'use strict'

const Pool = require('pg').Pool;

const { logger } = require('../utils');

class PgsqlTracker {
  #pool;
  #tracker;
  #ttr;
  #query;

  constructor(connection, query, ttr) {
    this.#pool = new Pool(connection);
    this.#ttr = ttr;
    this.#query = query;
  }

  async #testDataBaseConnection() {
    try {
      await this.#pool.connect();
    } catch (err) {
      logger.error('Error connecting to the database', err.stack);
      throw err;
    }
  }

  #queryDataBase() {
    this.#pool.connect((err, client, release) => {
      if (err) {
        logger.error('Error acquiring client', err.stack);
        throw err;
      }

      client.query(this.#query, (err, result) => {
        release();
        if (err) {
          logger.error('Error executing query', err.stack);
          throw err;
        }
        console.log(result.rows);
      });

    });
  }

  async startTracker(ttr) {
    try {
      logger.info('[pgsqlTracker] : Testing connection to the database..');
      await this.#testDataBaseConnection();

      logger.info('[pgsqlTracker] : Connection to the database is successful');
      logger.info(`[pgsqlTracker] : Starting the tracker with a ttr: ${this.#ttr}`);
      this.#queryDataBase();
      this.#tracker = setInterval(() => {
        this.#queryDataBase();
      }, this.#ttr * 1000);
    } catch (err) {
      logger.error(err);
      throw(err);
    }
  }

  stopTracker() {
    clearInterval(this.#tracker);
  }
}

module.exports = PgsqlTracker;