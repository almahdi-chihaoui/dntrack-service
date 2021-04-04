const amqp = require('amqplib');

const { logger } = require('../utils');
const MessageBroker = require('./messageBroker');

const amqpUrl = process.env.AMQP_URL || 'amqp://localhost';

const getAmqpConnection = async () => {
  logger.info('[getAmqpConnection] : Connecting to RabbitMQ Message server..');
  try {
    const connection = await amqp.connect(amqpUrl);
    return connection;
  } catch (err) {
    logger.error('[messageBroker] : Something wrong happened while trying to connect to RabbitMQ server!', err);
    throw err;
  }
};

module.exports = {
  getAmqpConnection,
  MessageBroker,
};
