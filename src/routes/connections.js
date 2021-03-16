'use strict'

const { StatusCodes } = require('http-status-codes');

const { logger } = require('../utils');

const router = require('express').Router();

const { connectionsManager } = require('../tracking-manager');
const {
  INTERNAL_SERVER_ERROR,
  CREATED,
  OK,
} = require('../common/constants');

router.get('/connections/:id', (req, res, next) => {
  try {
    logger.info(`[Router]-[Get (one) /connections] : Getting connection..`);
    const connection = connectionsManager.getOne(req.params.id, req.query.dbms);
    res.status(StatusCodes[OK]);
    res.send(connection);
  } catch (err) {
    logger.error(`[Router]-[Get (one) /connections] : Something wrong happened: `, err);
    err.status = StatusCodes[err.code || INTERNAL_SERVER_ERROR];
    next(err);
  }
})

router.get('/connections', (req, res,  next) => {
  try {
    logger.info(`[Router]-[Get (all) /connections] : Getting connections..`);
    const connections = connectionsManager.getAll();
    res.status(StatusCodes[OK]);
    res.send(connections);
  } catch (err) {
    logger.error(`[Router]-[Get (all) /connections] : Something wrong happened: `, err);
    err.status = StatusCodes[err.code || INTERNAL_SERVER_ERROR];
    next(err);
  }
});

router.post('/connections', (req, res, next) => {
  try {
    logger.info(`[Router]-[Post /connections] : Adding a connection..`);
    const id = connectionsManager.add(req.body, req.query.dbms);

    logger.info(`[Router]-[Post /connections] : Successfully added a connection..`);
    res.status(StatusCodes[CREATED]);
    res.send({ id });
  } catch (err) {
    logger.error(`[Router]-[Post /connections] : Something wrong happened: `, err);
    err.status = StatusCodes[err.code || INTERNAL_SERVER_ERROR];
    next(err);
  }
});

router.delete('/connections/:id', (req, res, next) => {
  try {
    logger.info(`[Router]-[Delete /connections] : Deleting a connection..`);
    connectionsManager.delete(req.params.id, req.query.dbms);

    logger.info(`[Router]-[Delete /connections] : Successfully deleted a connection..`);

    res.sendStatus(StatusCodes[OK]);
  } catch (err) {
    logger.error(`[Router]-[Delete /connections] : Something wrong happened: `, err);
    err.status = StatusCodes[err.code || INTERNAL_SERVER_ERROR];
    next(err);
  }
});

module.exports = router;
