const ws = new WebSocket('wss://juniper.beer');
let start;
let close;
ws.onopen = (event) => {
    start = Date.now();
    console.log('Websocket is open');
};
ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log(JSON.stringify(msg, null, 2));
    const cmd = msg.cmd;
    if (cmd === 'answer') {
        receiveAnswer(msg);
    } else if (cmd === 'offer') {
        receiveOffer(msg);
    } else if (cmd === 'candidate') {
        recieveRemoteCandidate(msg);
    }
};

ws.onclose = (event) => {
    close = Date.now();
    console.log('WEBSOCKET HAS CLOSED');
    console.log(event);
    console.log(`socket lasted: ${(close-start)/1000} seconds`);
}



document.querySelector('body').onload = initParams;
document.querySelector('#shareScreen--button').onclick = initiateAudioStream;

let   studentId;
const studentScreen = document.getElementById("screen");
let   videoConnection;

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
    if (msg.video) {
        console.log('remote candidate');
        console.log(msg.candidate)
        await videoConnection.addIceCandidate(msg.candidate);
    } else {
        await audioConnection.addIceCandidate(msg.candidate);
    }
}

function initParams(){
    const urlParams = new URLSearchParams(window.location.search);
    studentId = urlParams.get('id');
    // const name = urlParams.get('name');
    // let firstname = document.getElementById('firstname');
    // firstname.textContent = name;
}

async function receiveOffer (msg) {
    videoConnection = new RTCPeerConnection(config);
    videoConnection.ontrack = (event) => {
        console.log('PROCTOR DID RECEIVE VIDEO TRACK');
        console.log(event.streams[0]);
        studentScreen.srcObject = event.streams[0];
    }

    await videoConnection.setRemoteDescription(msg.description);


    myVideo = await navigator.mediaDevices.getDisplayMedia({video: true});

    myVideo.getTracks().forEach(track => videoConnection.addTrack(track, myVideo));

    const localDescription = videoConnection.createAnswer({offerToReceiveVideo: true});
    await videoConnection.setLocalDescription(localDescription);

    const res = {
        cmd: 'answer',
        target: msg.target,
        description: videoConnection.localDescription,
        video: true,
    };
    ws.send(JSON.stringify(res));

    videoConnection.onicecandidate = (event) =>{
        if (event.candidate) {
            const res = {
                cmd: 'candidate',
                target: msg.target,
                candidate: event.candidate,
                video: true,
            };
            ws.send(JSON.stringify(res));
        }
    };
}