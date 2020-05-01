'use strict';

const bodyParser = require('body-parser');
const Express = require('express');
const http = require('http');
const session = require('express-session');
const url = require('url');
const webSocket = require('ws');

const { BROKER_SUBSCRIBE } = require('./common/constants');
const brokerRouter = require('./router/broker');

const PUBLIC_PATH = 'public';
//
// // const fs = require('fs');
// // const server = https.createServer({
// // 	cert: fs.readFileSync('/path/to/cert.pem'),
// // 	key: fs.readFileSync('/path/to/key.pem')
// // });
//
const expressApp = new Express();
const { BROKER_PORT = 23423 } = require('optimist').argv;

const wsList = {};

const sessionParser = session({
    saveUninitialized: false,
    secret: 'securityCheck22#',
    resave: false
});

expressApp.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

expressApp.use(express.static(PUBLIC_PATH));
expressApp.use(sessionParser);
expressApp.use(bodyParser.json());
expressApp.use('/broker', brokerRouter);

const server = http.createServer(expressApp);
const wss = new webSocket.Server({ noServer: true, clientTracking: true });

server
    .on('upgrade', (request, socket, head) => {
        const pathname = url.parse(request.url).pathname || [];
        const [, pathBroker = '', pathSubscribe = '', socketId = ''] = pathname.split('/');
        const socketSubscribePath = `/${pathBroker}/${pathSubscribe}/`;
        console.log('--socketId', socketId);

        if (socketSubscribePath === BROKER_SUBSCRIBE) {
            sessionParser(request, {}, () => {
                if (!request.session.userId) {
                    socket.destroy();
                    return;
                }

                console.log('Session is parsed!');

                wss.handleUpgrade(request, socket, head, function (ws) {
                    wsList[request.session.userId] = {
                        active: true,
                        // socket: ws,
                    };
                    wss.emit('connection', ws, request);
                });
            });
        } else {
            socket.destroy();
        }
    });

wss.on('connection', function (wsClient, req) {
        const { session: { userId } } = req;
        wsClient
            .on('message', (message) => {
                console.log('received: %s', message, userId);
                wsClient.send(`message from server: reply on ${message}`);
            })
            .on('close', () => {
                console.log('closing: %s', userId);
                wsClient.terminate();
                clearInterval(wsList[userId]['interVal']);
                Reflect.deleteProperty(wsList, userId);
            });
        wsList[userId]['interVal'] = setInterval(() => {
            const dateNow = Date.now();
            wsClient.send(`message from server for ${userId}: ${dateNow}`);
            console.log('--wsList', Object.keys(wsList));
        }, 2000);
    });

server.listen(BROKER_PORT, () => console.log(`Message Broker is running on port ${BROKER_PORT}!`));