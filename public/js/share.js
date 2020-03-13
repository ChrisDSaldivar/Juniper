'use strict';

const ws = new WebSocket("ws://localhost:9090");

ws.onopen = () => {
    console.log("WebSocket is open now.")
    ws.send(JSON.stringify({PING: "PING"}));
};

document.getElementById('shareScreen--button').onclick = shareScreen;

async function shareScreen () {
    console.log(navigator.mediaDevices.getSupportedConstraints());
};
