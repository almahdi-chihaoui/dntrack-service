'use strict'

const { logger } = require('../utils');

const router = require('express').Router();

const { trackersManager } = require('../tracking-manager');

router.post('/trackers', (req, res, next) => {
  try {
    logger.info(`[Router]-[Post /tracker] : Adding a tracker..`);
    const id = trackersManager.add(req.body);

    logger.info(`[Router]-[Post /tracker] : Successfully added a tracker..`);

    res.send({ id });
  } catch (err) {
    logger.error(`[Router]-[Post /tracker] : Something wrong happened: `, err);
    next(err);
  }
});

router.delete('/trackers', (req, res, next) => {
  try {
    logger.info(`[Router]-[Delete /tracker] : Deleting a tracker.. ${req.query.id}`);
    trackersManager.delete(req.query.id);

    logger.info(`[Router]-[Delete /tracker] : Successfully added a tracker..`);

    res.sendStatus(200);
  } catch (err) {
    logger.error(`[Router]-[Delete /tracker] : Something wrong happened: `, err);
    next(err);
  }
});

module.exports = router;
