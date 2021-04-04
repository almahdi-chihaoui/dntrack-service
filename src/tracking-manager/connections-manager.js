/* eslint-disable class-methods-use-this */
const { v4: uuidv4 } = require('uuid');

const {
  CONNECTIONS_JSON_FILE_PATH,
  NOT_FOUND,
} = require('../common/constants');
const {
  logger,
  jsonFile,
} = require('../utils');
const DbsTrackers = require('./trackers');

class ConnectionsManager {
  getOne(id, dbms) {
    try {
      // Fetch connections data
      const connectionsData = jsonFile.fetch(CONNECTIONS_JSON_FILE_PATH) || {};

      // Check if connection exist
      if (connectionsData[dbms]
        && connectionsData[dbms].length > 0) {
        const connection = connectionsData[dbms].find((cnx) => cnx.id === id);
        if (connection !== undefined) {
          return connection;
        }
      }

      // Throw a not found error
      const err = new Error('connection not found');
      err.code = NOT_FOUND;
      throw err;
    } catch (err) {
      logger.error('[Connections Manager]-[Get One Connection] : Could not get connection, something wrong happened : ', err);
      throw err;
    }
  }

  getAll() {
    try {
      const connections = jsonFile.fetch(CONNECTIONS_JSON_FILE_PATH);

      // Check if there are connections
      if (connections && Object.keys(connections).length > 0) {
        return connections;
      }

      // Throw a not found error
      const err = new Error('no connections were found');
      err.code = NOT_FOUND;
      throw err;
    } catch (err) {
      logger.error('[Connections Manager]-[Get All Connections] : Could not get connections, something wrong happened : ', err);
      throw err;
    }
  }

  async add(data, dbms) {
    try {
      // Test connection
      await DbsTrackers[dbms].testConnection(data);

      // Add an id and and copy the data in new object
      const idedData = { ...data, id: uuidv4() };

      // Fetch connections data
      const connectionsData = jsonFile.fetch(CONNECTIONS_JSON_FILE_PATH) || {};

      // Add data and dispatch
      logger.info('[Connections Manager]-[Add Connection] : Adding a new connection..');
      if (connectionsData[dbms] && connectionsData[dbms].length > 0) {
        connectionsData[dbms] = connectionsData[dbms].concat([idedData]);
      } else {
        connectionsData[dbms] = [idedData];
      }

      jsonFile.dispatch(connectionsData, CONNECTIONS_JSON_FILE_PATH);

      logger.info(`[Connections Manager]-[Add Connection] : Connection with id ${idedData.id} was added successfully`);
      return idedData.id;
    } catch (err) {
      logger.error('[Connections Manager]-[Add Connection] : Could not add connection, something wrong happened : ', err);
      throw err;
    }
  }

  update() {
    // TODO
  }

  delete(id, dbms) {
    try {
      // Fetch connections data
      const connectionsData = jsonFile.fetch(CONNECTIONS_JSON_FILE_PATH);

      // Check if connection exist
      if (connectionsData[dbms]
        && connectionsData[dbms].length > 0
        && connectionsData[dbms].find((connection) => connection.id === id) !== undefined) {
        // Delete connection data and dispatch
        connectionsData[dbms] = connectionsData[dbms]
          .filter((connection) => connection.id !== id);

        if (connectionsData[dbms].length === 0) {
          delete connectionsData[dbms];
        }

        jsonFile.dispatch(connectionsData, CONNECTIONS_JSON_FILE_PATH);

        logger.info(`[Connections Manager]-[Delete Connection] : Connection with id ${id} was deleted successfully`);
      } else {
        // Throw a not found error
        const err = new Error('connection not found');
        err.code = NOT_FOUND;
        throw err;
      }
    } catch (err) {
      logger.error('[Connections Manager]-[Delete Connection] : Could not delete connection, something wrong happened : ', err);
      throw err;
    }
  }
}

module.exports = ConnectionsManager;
