'use strict'

const TrackersManager = require('./trackers-manager');
const ConnectionsManager = require('./connections-manager');

const trackersManager = new TrackersManager();
const connectionsManager = new ConnectionsManager();

module.exports = {
  trackersManager,
  connectionsManager,
}