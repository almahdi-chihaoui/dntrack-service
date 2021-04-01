/* eslint-disable class-methods-use-this */
const { v4: uuidv4 } = require('uuid');

const { NOT_FOUND } = require('../common/constants');
const {
  logger,
  jsonFile,
} = require('../utils');

const DbsTrackers = require('./trackers');
const { getAmqpConnection } = require('../message-broker');

const trackersFilePath = './app_data/trackers.json';

class TrackersManager {
  #trackers = [];

  #messageBrokerConnection = null;

  getOne(id) {
    try {
      // Fetch trackers data
      const trackersData = jsonFile.fetch(trackersFilePath);

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
      return jsonFile.fetch(trackersFilePath);
    } catch (err) {
      logger.error('[Trackers Manager]-[Get All Trackers] : Could not get trackers, something wrong happened : ', err);
      throw err;
    }
  }

  async add(data, connection) {
    try {
      // Fetch trackers data
      let trackersData = jsonFile.fetch(trackersFilePath);

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
      jsonFile.dispatch(trackersData, trackersFilePath);

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
      let trackersData = jsonFile.fetch(trackersFilePath);

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
      jsonFile.dispatch(trackersData, trackersFilePath);
    } catch (err) {
      logger.error('[Trackers Manager]-[Delete Tracker] : Could not delete tracker, something wrong happened : ', err);
      throw err;
    }
  }
}

module.exports = TrackersManager;
