const express = require('express');
const { StatusCodes } = require('http-status-codes');

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

const { httpLogger } = require('./src/middlewares');
const {
  connectionsRouter,
  trackersRouter,
} = require('./src/routes');

const { logger } = require('./src/utils');
const { INTERNAL_SERVER_ERROR } = require('./src/common/constants');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.use(httpLogger);

app.use(trackersRouter);
app.use(connectionsRouter);

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || StatusCodes[INTERNAL_SERVER_ERROR]);
  res.send({
    type: 'error',
    status: err.status,
    message: err.message,
    stack: req.app.get('env') === 'development' ? err.stack : undefined,
  });
});

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
