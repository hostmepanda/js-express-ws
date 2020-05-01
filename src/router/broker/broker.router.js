'use strict';

const express = require('express');

const router = express.Router();
const controller = require('./broker.controller');

router.post('/auth', controller.auth);
router.post('/publish', controller.publish);
router.post('/unsubscribe', controller.unsubscribe);

module.exports = router;