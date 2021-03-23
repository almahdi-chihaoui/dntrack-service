'use strict'

const express = require('express');
var bodyParser = require('body-parser')

const { httpLogger } = require('./src/middlewares');
const {
  connectionsRouter,
  trackersRouter,
} = require('./src/routes');

const { logger } = require('./src/utils');
const { INTERNAL_SERVER_ERROR } = require('./src/common/constants');
const { StatusCodes } = require('http-status-codes');

const PORT = 3005;
const app = express();

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Parse application/json
app.use(bodyParser.json())

app.use(httpLogger);

app.use(trackersRouter);
app.use(connectionsRouter);

// Error handler
app.use(function (err, req, res, next) {
  res.status(err.status || StatusCodes[INTERNAL_SERVER_ERROR]);
  res.send({
    type: 'error',
    status: err.status,
    message: err.message,
    stack: req.app.get('env') === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});