'use strict';

const uuid = require('uuid');

const { CommonError } = require('../../common/errorHandler');
const { Logger } = require('../../common/logger');
const logger = new Logger('brokerController');

class brokerController {
    async auth (req, res) {
        logger.info({
            marker: 'auth request',
            data: {
                body: { ...req.body },
            },
        });

        try {
            const authPassed = await brokerController.checkAuth(req);
            if (authPassed) {
                const sessionUserId = uuid.v4();
                req.session.userId = sessionUserId;
                logger.info({ marker: 'auth request', data: `Updating session for user with id ${sessionUserId}`});
                await brokerController.setOrUpdateSessionId(sessionUserId, { ...req.body });
                res.send({ success: true, ws: sessionUserId });
            } else {
                logger.info({ marker: 'auth request', data: `authPassed returned null`});
                res.status(401).send();
            }
        } catch (error) {
            logger.info({ marker: 'auth', data: error });
            throw new CommonError('Can\'t authorize request');
        }
    }

    async unsubscribe (req, res) {
        console.log('Destroying session');
        req.session.destroy(() => {
            if (this.ws) {

                this.ws = undefined;
            }
            res.send({ result: 'OK', message: 'Session destroyed' });
        });
    }

    async publish (req, res, next) {

    }

    static async checkAuth () {
        try {
            logger.info({ marker: 'checkAuth' });
            return true;
        }	catch (error) {
            logger.info({ marker: 'checkAuth', data: error });
            throw new CommonError('Can\'t authorize request');
        }
    }

    static async setOrUpdateSessionId (sessionId, data = null) {
        logger.info({
            marker: 'update session',
            data: `websocket:${sessionId} ${JSON.stringify(data)}`,
        });
    }
}

module.exports = new brokerController();
