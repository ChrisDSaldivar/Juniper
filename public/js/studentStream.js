const ws = new WebSocket('wss://juniper.beer');
let start;
let close;
ws.onopen = (event) => {
    start = Date.now();
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
        console.log('received offer');
        receiveOffer(msg.target, msg.description);
    } else if (cmd === 'candidate') {
        recieveRemoteCandidate(msg);
    } else if (cmd === 'answer') {
        receiveAnswer(msg);
    }
};


ws.onclose = (event) => {
    close = Date.now();
    console.log('WEBSOCKET HAS CLOSED');
    console.log(event);
    console.log(`socket lasted: ${(close-start)/1000} seconds`);
}

async function receiveOffer (target, description) {
    audioConnection = new RTCPeerConnection(config);
    console.log('created audio connection')
    
    // when the audio track opens; stream to audio element
    audioConnection.ontrack = (event) => {
        console.log('STUDENT DID RECEIVE AUDIO TRACK');
        console.log(event.streams[0]);
        proctorAudio.srcObject = event.streams[0];
    };

    await audioConnection.setRemoteDescription(description);
    console.log('remote description set')
    
    // get student audio stream and add to peer connection
    studentAudio = await navigator.mediaDevices.getUserMedia(audioConstraints);
    console.log('local audio stream retrieved')
    studentAudio.getTracks().forEach( track => audioConnection.addTrack(track, studentAudio));

    // setup local description to send peer
    const localDescription = audioConnection.createAnswer({offerToReceiveAudio: true});
    console.log('created answer')
    await audioConnection.setLocalDescription(localDescription);
    console.log('local description set')

    const msg = {
        cmd: 'answer',
        target,
        description: audioConnection.localDescription
    };

    ws.send(JSON.stringify(msg));
    shareScreen(target);

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
        console.log('remote candidate');
        console.log(msg.candidate)
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
                candidate: event.candidate,
                video: true
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