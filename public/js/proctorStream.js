const ws = new WebSocket('wss://juniper.beer');
ws.onopen = (event) => {
    console.log('Websocket is open');
};

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log(JSON.stringify(msg, null, 2));
    const cmd = msg.cmd;
    if (cmd === 'answer') {
        receiveAnswer(msg);
    }
};


document.querySelector('body').onload = initParams;
document.querySelector('#shareScreen--button').onclick = initiateAudioStream;

let   studentId;
const studentScreen = document.getElementById("screen");

const studentAudio  = document.getElementById("voice");
let   audioConnection;
let   proctorAudio;

const audioConstraints = {
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
    }
};

const config = {iceServers: [{urls: ["stun:stun.l.google.com:19302"]}]};

async function initiateAudioStream () {
    const target = studentId;
    // create connection
    audioConnection = new RTCPeerConnection(config);
    // get my audio stream
    proctorAudio = await navigator.mediaDevices.getUserMedia(audioConstraints);
    // add the audio to the peer connection
    proctorAudio.getTracks().forEach(track => audioConnection.addTrack(track, proctorAudio));
    // set handler for ice candidates
    audioConnection.onicecandidate = (event) => {
        if (event.candidate) {
            const msg = {
                cmd: 'candidate',
                target,
                candidate: event.candidate
            };
            ws.send(JSON.stringify(msg));
        }
    };

    audioConnection.ontrack = (event) => {
        console.log('PROCTOR DID RECEIVE AUDIO TRACK');
        console.log(event.streams[0])
        studentAudio.srcObject = event.streams[0];
    }
    
    // create the offer
    const description = await audioConnection.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: false});
    // set the local description of the p2p connection
    await audioConnection.setLocalDescription(description);
    // send the info to the server
    const msg = {
        cmd: "offer",
        target,
        description: audioConnection.localDescription
    }
    ws.send(JSON.stringify(msg));
}


async function receiveAnswer (msg) {
    await audioConnection.setRemoteDescription(msg.description);

}

async function recieveRemoteCandidate (msg) {
    await audioConnection.addIceCandidate(msg.candidate);
}


// function offer (id, description) {
//     peerConnection
//         .setRemoteDescription(description)
//         .then(() => peerConnection.createAnswer())
//         .then(sdp => peerConnection.setLocalDescription(sdp))
//         .then(() => {
//             const msg = {
//                 cmd: "answer",
//                 id,
//                 localDescription: peerConnection.localDescription
//             }
//             ws.send(JSON.stringify(msg));
//         });
//     peerConnection.ontrack = event => {

//         video.srcObject = event.streams[0];
//     };
//     peerConnection.onicecandidate = event => {
//         if (event.candidate) {
//             const msg = {
//                 cmd: "candidate",
//                 id,
//                 candidate: event.candidate
//             }
//             ws.send(JSON.stringify(msg));
//         }
//     };
// }

function initParams(){
    const urlParams = new URLSearchParams(window.location.search);
    studentId = urlParams.get('id');
    // const name = urlParams.get('name');
    // let firstname = document.getElementById('firstname');
    // firstname.textContent = name;
}