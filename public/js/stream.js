'use strict';

const ws = new WebSocket('ws://localhost:9090');
let lastPeerId = null;
let peer = null; // own peer object
let conn = null;

// Element refs
const videoElem = document.getElementById("screen");
const audioElem = document.getElementById("voice");


ws.onopen = (event) => {
    console.log("WebSocket is open now.");
    ws.send('PING');
};
ws.onmessage = (event) => {
    console.log(`WebSocket message received: ${event.data}`);
}

document.getElementById('shareScreen--button').onclick = shareScreen;
document.getElementById('stopCapture--button').onclick = stopCapture;

async function shareScreen () {
    console.log(navigator.mediaDevices.getSupportedConstraints());
    startCapture();
}

async function startCapture() {
    try {
        const displayMediaOptions = {
            video: {
                cursor: "motion"
            }
        };
        videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        audioElem.srcObject = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            },
            video: false,
        });
        videoElem.srcObject.getVideoTracks().forEach((track) => {
            track.contentHint = 'text';
        });
    } catch(err) {
        console.error("Error: " + err);
    }
}

function stopCapture (evt) {
    let videoTracks = videoElem.srcObject.getTracks();
    console.log(audioElem.srcObject)
    let audioTracks = audioElem.srcObject.getTracks();
  
    videoTracks.forEach(track => track.stop());
    videoElem.srcObject = null;

    audioTracks.forEach(track => track.stop());
    audioElem.srcObject = null;
}