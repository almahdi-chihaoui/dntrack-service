'use strict'

const express = require('express');
const { httpLogger } = require('./src/middlewares');
const { logger } = require('./src/utils');

const PORT = 3005;
const app = express();

app.use(httpLogger);

require('./src');

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});