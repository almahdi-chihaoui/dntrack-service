const fs = require('fs');

const logger = require('./logger');

function fetch(path) {
  try {
    logger.info(`[JSON File Service]-[Fetch]: Reading from file ${path}..`);
    if (!fs.existsSync(path)) {
      logger.error(`[JSON File Service]-[Fetch]: File ${path} not found!`);
      return undefined;
    }
    const rawdata = fs.readFileSync(path);
    const data = JSON.parse(rawdata);

    logger.info('[JSON File Service]-[Fetch]: Done');
    return data;
  } catch (error) {
    logger.error('[JSON File Service]-[Fetch]: Something wrong happened: ', error);
    throw error;
  }
}

function dispatch(data, path) {
  try {
    logger.info(`[JSON File Service]-[Dispatch]: Writing to file ${path}..`);
    fs.writeFileSync(
      path,
      JSON.stringify(data),
    );

    logger.info('[JSON File Service]-[Dispatch]: Done');
  } catch (error) {
    logger.error('[JSON File Service]-[Dispatch]: Something wrong happened: ', error);
    throw error;
  }
}

module.exports = {
  fetch,
  dispatch,
};
