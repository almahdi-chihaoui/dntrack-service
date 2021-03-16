'use strict'

const { v4: uuidv4 } = require('uuid');

const { NOT_FOUND } = require('../common/constants');
const {
  logger,
  jsonFile,
} = require('../utils');

const PgsqlTracker = require('./trackers/pgsqlTracker');

const trackersFilePath = './app_data/trackers.json';
const connectionsFilePath = './app_data/connections.json';

class TrackersManager {
  #trackers = [];

  getOne(id, dbms) {
    try {
      // Fetch trackers data
      const trackersData = jsonFile.fetch(trackersFilePath);

      // Check if tracker exist
      if (trackersData && trackersData.length > 0) {
        const tracker = trackersData.find(tracker => tracker.id === id);
        if (tracker !== undefined) {
          return tracker;
        }
      }

      // Throw a not found error
      const err = new Error('tracker not found');
      err.code = NOT_FOUND;
      throw err;
    } catch (err) {
      logger.error(`[Trackers Manager]-[Get One Tracker] : Could not get tracker, something wrong happened : `, err);
      throw err;
    }

  }

  getAll() {
    try {
      return jsonFile.fetch(trackersFilePath);
    } catch (err) {
      logger.error(`[Trackers Manager]-[Get All Trackers] : Could not get trackers, something wrong happened : `, err);
      throw err;
    }
  }

  add(data) { //TODO: more error handling here
    if (data.dbms === 'pgsql') {
      // Add an id and and copy the data in new object
      const idedData = Object.assign({}, data, { id: uuidv4() });

      // Fetch connections data
      const connectionsData = jsonFile.fetch(connectionsFilePath);

      // Check and retrieve the tracker's connection details
      let connection = {};
      if (connectionsData[data.dbms] !== undefined && connectionsData[data.dbms].length > 0) {
        connection = connectionsData[data.dbms].find(cnx => cnx.id === data.connection);
        if (connection === undefined) {
          const errMsg = `[Trackers Manager]-[Add Tracker] : Connection with id ${data.connection} was not found`;
          logger.error(errMsg);
          throw new Error(errMsg);
        }
      } else {
        const errMsg = `[Trackers Manager]-[Add Tracker] : DBMS ${data.dbms}'s connection details were not found`
        logger.error(errMsg);
        throw new Error(errMsg);
      }

      // Start a new pgsqlTracker instance
      const pgsqlTracker = new PgsqlTracker(connection, idedData.query, idedData.ttr);
      pgsqlTracker.startTracker(data.resource);

      // Store the new pgsqlTracker instance
      this.#trackers = this.#trackers.concat([
        {
          id: idedData.id,
          instance: pgsqlTracker,
        }
      ]);

      // Fetch trackers data
      let trackersData = jsonFile.fetch(trackersFilePath);

      // Add data and dispatch
      trackersData = trackersData.concat([idedData]);
      jsonFile.dispatch(trackersData, trackersFilePath);

      // Return the id of the newly added tracker
      return idedData.id;
    }
  }

  update(id, data) {
    //TODO
  }

  delete(id) {
    try {
      // Fetch trackers data
      let trackersData = jsonFile.fetch(trackersFilePath);

      // Stop and delete tracker instance
      const targetTracker = this.#trackers
        .find(tracker => tracker.id === id)

      if (targetTracker === undefined) {
        const err = new Error('tracker not found');
        err.code = NOT_FOUND;
        throw err;
      }

      targetTracker
        .instance
        .stopTracker();

      targetTracker.instance = null;

      this.#trackers = this.#trackers
        .filter(tracker => tracker.id !== id);

      // Delete tracker data and dispatch
      trackersData = trackersData
        .filter(tracker => tracker.id !== id);
      jsonFile.dispatch(trackersData, trackersFilePath);
    } catch (err) {
      logger.error(`[Trackers Manager]-[Delete Tracker] : Could not delete tracker, something wrong happened : `, err);
      throw err;
    }
  }
}

module.exports = TrackersManager