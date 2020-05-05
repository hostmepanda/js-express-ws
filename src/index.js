'use strict';

const bodyParser = require('body-parser');
const Express = require('express');
const http = require('http');

const { SERVER_UPGRADE } = require('./common/constants');
const brokerRouter = require('./router/broker');
const { sessionParser, upgradeHandler } = require('./server/server');

const PUBLIC_PATH = 'public';
//
// // const fs = require('fs');
// // const server = https.createServer({
// // 	cert: fs.readFileSync('/path/to/cert.pem'),
// // 	key: fs.readFileSync('/path/to/key.pem')
// // });
//
const expressApp = new Express();
const BROKER_PORT = 23423;

expressApp.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

expressApp.use(Express.static(PUBLIC_PATH));
expressApp.use(sessionParser);
expressApp.use(bodyParser.json());
expressApp.use('/broker', brokerRouter);

const server = http.createServer(expressApp);
server.on(SERVER_UPGRADE, upgradeHandler);

server.listen(BROKER_PORT, () => console.log(`Message Broker is running on port ${ BROKER_PORT }!`));