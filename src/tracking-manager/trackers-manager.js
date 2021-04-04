/* eslint-disable class-methods-use-this */
const { v4: uuidv4 } = require('uuid');

const {
  NOT_FOUND,
  TRACKERS_JSON_FILE_PATH,
} = require('../common/constants');
const {
  logger,
  jsonFile,
} = require('../utils');

const DbsTrackers = require('./trackers');
const { getAmqpConnection } = require('../message-broker');

class TrackersManager {
  #trackers = [];

  #messageBrokerConnection = null;

  getOne(id) {
    try {
      // Fetch trackers data
      const trackersData = jsonFile.fetch(TRACKERS_JSON_FILE_PATH);

      // Check if tracker exist
      if (trackersData && trackersData.length > 0) {
        const tracker = trackersData.find((trckr) => trckr.id === id);
        if (tracker !== undefined) {
          return tracker;
        }
      }

      // Throw a not found error
      const err = new Error('tracker not found');
      err.code = NOT_FOUND;
      throw err;
    } catch (err) {
      logger.error('[Trackers Manager]-[Get One Tracker] : Could not get tracker, something wrong happened : ', err);
      throw err;
    }
  }

  getAll() {
    try {
      const trackers = jsonFile.fetch(TRACKERS_JSON_FILE_PATH);

      // Check if there are trackers
      if (trackers && trackers.length > 0) {
        return trackers;
      }

      // Throw a not found error
      const err = new Error('no trackers were found');
      err.code = NOT_FOUND;
      throw err;
    } catch (err) {
      logger.error('[Trackers Manager]-[Get All Trackers] : Could not get trackers, something wrong happened : ', err);
      throw err;
    }
  }

  async add(data, connection) {
    try {
      // Fetch trackers data
      let trackersData = jsonFile.fetch(TRACKERS_JSON_FILE_PATH) || [];

      // Add an id and and copy the data in new object
      const idedData = { ...data, id: uuidv4() };

      // Start a new tracker instance
      let tracker;
      try {
        // Get a message broker connection if there isn't any
        if (!this.#messageBrokerConnection) {
          this.#messageBrokerConnection = await getAmqpConnection();
        }

        tracker = new DbsTrackers[data.dbms](
          connection,
          idedData.query,
          idedData.ttr,
          this.#messageBrokerConnection,
        );

        await tracker.start();
      } catch (err) {
        logger.error('[Trackers Manager]-[Add Tracker] : Could not start a new tracker instance, something wrong happened : ', err);
        throw err;
      }

      // Store the new tracker instance
      this.#trackers = this.#trackers.concat([
        {
          id: idedData.id,
          instance: tracker,
        },
      ]);

      // Add data and dispatch
      trackersData = trackersData.concat([idedData]);
      jsonFile.dispatch(trackersData, TRACKERS_JSON_FILE_PATH);

      // Return the id of the newly added tracker
      return idedData.id;
    } catch (err) {
      logger.error('[Trackers Manager]-[Add Tracker] : Could not add tracker, something wrong happened : ', err);
      throw err;
    }
  }

  update() {
    // TODO
  }

  delete(id) {
    try {
      // Fetch trackers data
      let trackersData = jsonFile.fetch(TRACKERS_JSON_FILE_PATH) || [];

      // Stop and delete tracker instance
      const targetTracker = this.#trackers
        .find((tracker) => tracker.id === id);

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
        .filter((tracker) => tracker.id !== id);

      // Delete tracker data and dispatch
      trackersData = trackersData
        .filter((tracker) => tracker.id !== id);
      jsonFile.dispatch(trackersData, TRACKERS_JSON_FILE_PATH);
    } catch (err) {
      logger.error('[Trackers Manager]-[Delete Tracker] : Could not delete tracker, something wrong happened : ', err);
      throw err;
    }
  }
}

module.exports = TrackersManager;
