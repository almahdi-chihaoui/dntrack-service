'use strict'

const { StatusCodes } = require('http-status-codes');

const { logger } = require('../utils');

const router = require('express').Router();

const {
  connectionsManager,
  trackersManager,
} = require('../tracking-manager');

const {
  INTERNAL_SERVER_ERROR,
  CREATED,
  OK,
} = require('../common/constants');

router.get('/trackers/:id', (req, res, next) => {
  try {
    logger.info(`[Router]-[Get (one) /trackers] : Getting tracker..`);
    const tracker = trackersManager.getOne(req.params.id, req.query.dbms);
    res.status(StatusCodes[OK]);
    res.send(tracker);
  } catch (err) {
    logger.error(`[Router]-[Get (one) /trackers] : Something wrong happened: `, err);
    err.status = StatusCodes[err.code || INTERNAL_SERVER_ERROR];
    next(err);
  }
})

router.get('/trackers', (req, res, next) => {
  try {
    logger.info(`[Router]-[Get (all) /trackers] : Getting trackers..`);
    const trackers = trackersManager.getAll();
    res.status(StatusCodes[OK]);
    res.send(trackers);
  } catch (err) {
    logger.error(`[Router]-[Get (all) /trackers] : Something wrong happened: `, err);
    err.status = StatusCodes[err.code || INTERNAL_SERVER_ERROR];
    next(err);
  }
});

router.post('/trackers', (req, res, next) => {
  try {
    logger.info(`[Router]-[Post /trackers] : Adding a tracker..`);
    const data = req.body;

    // Get the tracker's connection details
    logger.info(`[Router]-[Post /trackers] : Getting tracker's connection details tracker..`);
    const connection = connectionsManager.getOne(data.connection, data.dbms);

    // Add the tracker and get its id
    const id = trackersManager.add(data, connection);

    logger.info(`[Router]-[Post /trackers] : Successfully added a tracker..`);
    res.status(StatusCodes[CREATED]);
    res.send({ id });
  } catch (err) {
    logger.error(`[Router]-[Post /trackers] : Something wrong happened: `, err);
    err.status = StatusCodes[err.code || INTERNAL_SERVER_ERROR];
    next(err);
  }
});

router.delete('/trackers/:id', (req, res, next) => {
  try {
    logger.info(`[Router]-[Delete /trackers] : Deleting a tracker..`);
    trackersManager.delete(req.params.id);

    logger.info(`[Router]-[Delete /trackers] : Successfully deleted a tracker..`);

    res.sendStatus(StatusCodes[OK]);
  } catch (err) {
    logger.error(`[Router]-[Delete /trackers] : Something wrong happened: `, err);
    err.status = StatusCodes[err.code || INTERNAL_SERVER_ERROR];
    next(err);
  }
});

module.exports = router;
