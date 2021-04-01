const MongoDBTracker = require('./mongodbTracker');
const PgsqlTracker = require('./pgsqlTracker');

const DbsTrackers = {
  mongodb: MongoDBTracker,
  pgsql: PgsqlTracker,
};

module.exports = DbsTrackers;
