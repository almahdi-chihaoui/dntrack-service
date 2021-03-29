'use strict'

const { logger } = require('../utils');

class MessageBroker {
  #connection;
  #channel;

  constructor(connection) {
    this.#connection = connection;
  }

  async init() {
    logger.info('[messageBroker] : Initializing a RabbitMQ Message Broker..');
    try {
      logger.info('[messageBroker] : Creating a new RabbitMQ channel..');
      this.#channel = await this.#connection.createChannel();
    } catch (err) {
      logger.error('[messageBroker] : Something wrong happened while trying to create a new RabbitMQ channel!', err);
      throw err;
    }
  }

  sendMessage(queue, message) {
    logger.info(`[messageBroker] : Sending message to queue ${queue}..`);
    try {
      this.#channel.assertQueue(queue, {
        durable: true,
      });
      this.#channel.sendToQueue(queue, Buffer.from(message));
      logger.info(`[messageBroker] : Data ${message} were successfully sent to queue ${queue}`);
    } catch (err) {
      logger.error('[messageBroker] : Something wrong happened while trying to send data', err);
      throw err;
    }
  }

  closeChannel() {
    this.#channel.close();
  }
}

module.exports = MessageBroker;