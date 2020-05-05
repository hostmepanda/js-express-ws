'use strict';

const config = require('config');
const session = require('express-session');
const url = require('url');

const { BROKER_SUBSCRIBE, WS_CONNECTION, WebSocketList } = require('../common/constants');
const { Logger } = require('../common/logger');
const { webSocketHandler, wss } = require('../webSocket/webSocket');

const sessionParser = session(config.get('sessionParserOptions'));
const logger = new Logger('server');

const upgradeHandler = (request, socket, head) => {
	const pathname = url.parse(request.url).pathname || [];
	const [, pathBroker = '', pathSubscribe = '', socketId = ''] = pathname.split('/');
	const socketSubscribePath = `/${pathBroker}/${pathSubscribe}/`;
	logger.info({ marker: 'socketId', data: { socketId} });

	if (socketSubscribePath === BROKER_SUBSCRIBE) {
		sessionParser(request, {}, () => {
			if (!request.session.userId) {
				socket.destroy();
				logger.info({ marker: 'socket destroyed' });
				return;
			}

			wss.handleUpgrade(request, socket, head,  (ws) => {
				logger.info({ marker: 'socket upgraded', data: { userId: request.session.userId } });
				WebSocketList[request.session.userId] = { active: true };
				wss.emit('connection', ws, request);
			});
		});

		wss.on(WS_CONNECTION, webSocketHandler);
	} else {
		socket.destroy();
		logger.info({ marker: 'socket destroyed' });
	}
};

module.exports = {
	sessionParser,
	upgradeHandler,
};