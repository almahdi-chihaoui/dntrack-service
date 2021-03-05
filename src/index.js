'use strict'

const fs = require('fs')

const { logger } = require('./utils');



const appDataPath = './app_data/app_data.json';

try {
  if (fs.existsSync(appDataPath)) {
    logger.info('Found app_data json file');
    logger.info('Setting up trackers..');

    let rawdata = fs.readFileSync(appDataPath);
    let appData = JSON.parse(rawdata);
    console.log(appData);


  }

  logger.info('Standing by..');
} catch (err) {
  logger.error(err)
}