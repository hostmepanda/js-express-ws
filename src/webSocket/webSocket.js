'use strict';

const webSocket = require('ws');

const { WebSocketList } = require('../common/constants');
const { Logger } = require('../common/logger');
const { parseMessage } = require('./message');

const logger = new Logger('webSocket');
const wss = new webSocket.Server({ noServer: true, clientTracking: true });

const webSocketHandler = (wsClient, req) => {
    const { session: { userId } } = req;
    wsClient
        .on('message', (message) => {
            logger.info({ marker: 'message from client', data: { message, userId } });
            const parsed = parseMessage(message);

            if (parsed) {
            //   do something
            }
        })
        .on('close', () => {
            logger.info({ marker: 'Terminating webSocket, close event received', data: { userId } });
            wsClient.terminate();
            Reflect.deleteProperty(WebSocketList, userId);
        });
    logger.info({ marker: 'New webSocket', data: { userId } });
};

module.exports = {
    webSocketHandler,
    wss,
};