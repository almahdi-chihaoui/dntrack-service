'use strict'

const amqp = require('amqplib/callback_api');
const Pool = require('pg').Pool;

const { logger } = require('../../utils');

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

  #queryDataBase(queueName) {
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

        // amqp.connect('amqp://localhost', function (error0, connection) {
        //   if (error0) {
        //     throw error0;
        //   }
        //   connection.createChannel(function (error1, channel) {
        //     if (error1) {
        //       throw error1;
        //     }

        //     channel.assertQueue(queueName, {
        //       durable: true
        //     });

        //     channel.sendToQueue(queueName, Buffer.from(result.rows));
        //     console.log(" [x] Sent %s", result.rows);
        //   });

        //   setTimeout(function () {
        //     connection.close();
        //   }, 500);
        // });


      });

    });
  }

  async start(queueName) {
    try {
      logger.info('[pgsqlTracker] : Testing connection to the database..');
      await this.#testDataBaseConnection();

      logger.info('[pgsqlTracker] : Connection to the database is successful');
      logger.info(`[pgsqlTracker] : Starting the tracker with a ttr: ${this.#ttr}`);
      this.#queryDataBase();
      this.#tracker = setInterval(() => {
        this.#queryDataBase(queueName);
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