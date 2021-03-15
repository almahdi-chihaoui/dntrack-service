'use strict'

const { logger } = require('../utils');

const router = require('express').Router();

const { connectionsManager } = require('../tracking-manager');

router.post('/connections', (req, res, next) => {
  try {
    logger.info(`[Router]-[Post /connection] : Adding a connection..`);
    const id = connectionsManager.add(req.body);

    logger.info(`[Router]-[Post /connection] : Successfully added a connection..`);

    res.send({ id });
  } catch (err) {
    logger.error(`[Router]-[Post /connection] : Something wrong happened: `, err);
    next(err);
  }
});

router.delete('/connections', (req, res, next) => {
  try {
    logger.info(`[Router]-[Delete /connection] : Deleting a connection.. ${req.body}`);
    connectionsManager.delete(req.params.id);

    logger.info(`[Router]-[Delete /connection] : Successfully added a connection..`);

    res.send({ id });
  } catch (err) {
    logger.error(`[Router]-[Delete /connection] : Something wrong happened: `, err);
    next(err);
  }
});


module.exports = router;
