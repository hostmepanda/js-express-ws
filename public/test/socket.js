'use strict';

const loginButton = document.querySelector('#login');
const logoutButton = document.querySelector('#logout');
const sendButton = document.querySelector('#wsSendButton');
const displayMessageContainer = document.querySelector('#messages');

let ws;

function displayMessage(message) {
    displayMessageContainer.textContent += `\n${message.data}`;
    displayMessageContainer.scrollTop = displayMessageContainer.scrollHeight;
}

function sendMessage() {
    if (!ws) {
        displayMessage({ data: 'No WebSocket connection' });
        return;
    }
    ws.send('Hello World!');
    displayMessage({ data: 'Sent "Hello World!"' });
}

async function logOut() {
    ws.close(1000, 'disconnect');
    displayMessage({ data: 'closing connection with server' });
}

async function auth() {
    const authKey = 'someKey';
    const { data: { success, ws } } = await axios({
        url: 'http://localhost:23423/broker/auth',
        method: 'POST',
        crossDomain: false,
        data: { authKey }
    });
    if (success) {
        createWsClient(ws);
    }
}

function createWsClient(subscribeId) {
    if (ws) {
        ws.onerror = ws.onopen = ws.onclose = null;
        ws.close();
    }

    ws = new WebSocket(`ws://localhost:23423/broker/subscribe/${subscribeId}`);
    ws.onerror = () => displayMessage({ data: 'WebSocket error' });
    ws.onopen = () => displayMessage({ data: 'WebSocket connection established' });
    ws.onclose = () => {
        displayMessage({ data: 'WebSocket connection closed' });
        ws = null;
    };
    ws.onmessage = (message) => displayMessage(message);
}

loginButton.addEventListener('click', () => auth());
sendButton.addEventListener('click', () => sendMessage());
logoutButton.addEventListener('click', () => logOut());
