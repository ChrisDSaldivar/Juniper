'use strict';

const ws = new WebSocket('ws://localhost:9090');

ws.onopen = (event) => {
    console.log("WebSocket is open now.");
    ws.send('PING');
};

ws.onmessage = (event) => {
    console.log("WebSocket message received:", event.data);
}

document.getElementById('shareScreen--button').onclick = shareScreen;

async function shareScreen () {
    console.log(navigator.mediaDevices.getSupportedConstraints());
}
