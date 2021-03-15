'use strict'

const { v4: uuidv4 } = require('uuid');

const {
  logger,
  jsonFile,
} = require('../utils');

const PgsqlTracker = require('./trackers/pgsqlTracker');

const trackersFilePath = './app_data/trackers.json';
const connectionsFilePath = './app_data/connections.json';

class TrackersManager {
  #trackers = [];

  constructor() {

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

  }

  delete(id) {
    try {
      // Fetch trackers data
      let trackersData = jsonFile.fetch(trackersFilePath);

      // Stop and delete tracker instance
      this.#trackers
        .find(tracker => tracker.id === id)
        .instance
        .stopTracker();

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