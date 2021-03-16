'use strict'

const { v4: uuidv4 } = require('uuid');

const { NOT_FOUND } = require('../common/constants');
const {
  logger,
  jsonFile,
} = require('../utils');

const connectionsFilePath = './app_data/connections.json'

class ConnectionsManager {
  getOne(id, dbms) {
    try {
      // Fetch connections data
      const connectionsData = jsonFile.fetch(connectionsFilePath);

      // Check if connection exist
      if (connectionsData[dbms]
        && connectionsData[dbms].length > 0) {

        const connection = connectionsData[dbms].find(connection => connection.id === id);
        if (connection !== undefined) {
          return connection;
        }
      }

      // Throw a not found error
      const err = new Error('connection not found');
      err.code = NOT_FOUND;
      throw err;
    } catch (err) {
      logger.error(`[Connections Manager]-[Get One Connection] : Could not get connection, something wrong happened : `, err);
      throw err;
    }

  }


  getAll() {
    try {
      return jsonFile.fetch(connectionsFilePath);
    } catch (err) {
      logger.error(`[Connections Manager]-[Get All Connections] : Could not get connections, something wrong happened : `, err);
      throw err;
    }
  }

  add(data, dbms) {
    try {
      // Add an id and and copy the data in new object
      const idedData = Object.assign({}, data, { id: uuidv4() });

      // Fetch connections data
      const connectionsData = jsonFile.fetch(connectionsFilePath);

      // Add data and dispatch
      logger.info(`[Connections Manager]-[Add Connection] : Adding a new connection..`);
      if (connectionsData[dbms] && connectionsData[dbms].length > 0) {
        connectionsData[dbms] = connectionsData[dbms].concat([idedData]);
      } else {
        connectionsData[dbms] = [idedData];
      }

      jsonFile.dispatch(connectionsData, connectionsFilePath);

      logger.info(`[Connections Manager]-[Add Connection] : Connection with id ${idedData.id} was added successfully`);
      return idedData.id;
    } catch (err) {
      logger.error(`[Connections Manager]-[Add Connection] : Could not add connection, something wrong happened : `, err);
      throw err;
    }

  }

  update(id, dbms, data) {
    //TODO
  }

  delete(id, dbms) {
    try {
      // Fetch connections data
      const connectionsData = jsonFile.fetch(connectionsFilePath);

      // Check if connection exist
      if (connectionsData[dbms]
        && connectionsData[dbms].length > 0
        && connectionsData[dbms].find(connection => connection.id === id) !== undefined) {
        // Delete connection data and dispatch
        connectionsData[dbms] = connectionsData[dbms]
          .filter(connection => connection.id !== id);
        
        jsonFile.dispatch(connectionsData, connectionsFilePath);

        logger.info(`[Connections Manager]-[Delete Connection] : Connection with id ${id} was deleted successfully`);
      } else {
        // Throw a not found error
        const err = new Error('connection not found');
        err.code = NOT_FOUND;
        throw err;
      }

    } catch (err) {
      logger.error(`[Connections Manager]-[Delete Connection] : Could not delete connection, something wrong happened : `, err);
      throw err;
    }

  }
}

module.exports = ConnectionsManager;