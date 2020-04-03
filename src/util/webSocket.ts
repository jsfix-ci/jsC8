const ReconnectingWebSocket = require('reconnecting-websocket');
const WS = require('ws');

const options = {
    WebSocket: WS, // custom WebSocket constructor
};

export function ws(url: string) {
    return new ReconnectingWebSocket(url, null, options);
}

