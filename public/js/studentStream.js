const ws = new WebSocket('wss://juniper.beer');
ws.onopen = (event) => {
    console.log('Websocket is open');
};

let audioConnection;
let videoConnection;

const proctorAudio  = document.getElementById("voice");
const proctorScreen = document.getElementById("screen");
let   myAudio;
let   myVideo;

const audioConstraints = {
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
    }
};

const config = {
    iceServers: [
        {
            urls: ["stun:stun.l.google.com:19302"]
        }
    ]
};


document.onload = main;

async function main () {

}

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log(JSON.stringify(msg, null, 2));
    const cmd = msg.cmd;
    if (cmd === 'offer') {
        receiveOffer(msg.target, msg.description);
    } else if (cmd === 'candidate') {
        recieveRemoteCandidate(msg);
    } else if (cmd === 'answer') {
        receiveAnswer(msg);
    }
};

async function receiveOffer (target, description) {
    audioConnection = new RTCPeerConnection(config);
    
    // when the audio track opens; stream to audio element
    audioConnection.ontrack = (event) => {
        console.log('STUDENT DID RECEIVE AUDIO TRACK');
        console.log(event.streams[0]);
        proctorAudio.srcObject = event.streams[0];
    };

    await audioConnection.setRemoteDescription(description);
    
    // get student audio stream and add to peer connection
    studentAudio = await navigator.mediaDevices.getUserMedia(audioConstraints);
    studentAudio.getTracks().forEach( track => audioConnection.addTrack(track, studentAudio));

    // setup local description to send peer
    const localDescription = audioConnection.createAnswer({offerToReceiveAudio: true});
    await audioConnection.setLocalDescription(localDescription);

    const msg = {
        cmd: 'answer',
        target,
        description: audioConnection.localDescription
    };

    ws.send(JSON.stringify(msg));
    // shareScreen(target);

    // send connection candidates whenever they're available
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
}

async function recieveRemoteCandidate (msg) {
    if (msg.video) {
        await videoConnection.addIceCandidate(msg.candidate);
    } else {
        await audioConnection.addIceCandidate(msg.candidate);
    }
}

async function shareScreen (target) {
    videoConnection = new RTCPeerConnection(config);
    myVideo = await navigator.mediaDevices.getDisplayMedia({video: true});

    myVideo.getTracks().forEach(track => videoConnection.addTrack(track, myVideo));

    videoConnection.onicecandidate = (event) => {
        if (event.candidate) {
            const msg = {
                cmd: 'candidate',
                target,
                candidate: event.candidate
            };
            ws.send(JSON.stringify(msg));
        }
    };

    videoConnection.ontrack = (event) => {
        console.log('STUDENT DID RECEIVE VIDEO TRACK');
        console.log(event.streams[0])
        proctorScreen.srcObject = event.streams[0];
    };

    const description = await videoConnection.createOffer({offerToReceiveVideo: true});
    await videoConnection.setLocalDescription(description);

    const msg = {
        cmd: 'offer',
        target,
        description: videoConnection.localDescription,
        video: true,
    };
    ws.send(JSON.stringify(msg));
}

async function receiveAnswer (msg) {
    await videoConnection.setRemoteDescription(msg.description);
}