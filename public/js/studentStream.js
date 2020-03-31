let ws;
let start;
let close;
let retry;
let target;
createSocket('wss://juniper.beer/socket/course');
const flashes = document.querySelector(".flashes");

function createSocket (url) {
    ws = new WebSocket(url);
    ws.onopen = (event) => {
        start = Date.now();
        console.log('Websocket is open');
        clearInterval(retry);
    };
    ws.onerror = (e) => {
        console.log(e.code);
        window.location.reload();
    };
    
    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        console.log(JSON.stringify(msg, null, 2));
        const cmd = msg.cmd;
        if (cmd === 'offer') {
            console.log('received offer');
            target = msg.target;
            receiveOffer(target, msg.description);
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
        retry = setInterval(() => {
            createSocket(url);
            window.location.reload();
        }, 1000);
    }
}
let audioConnection;
let videoConnection;

const proctorAudio  = document.getElementById("voice");
const proctorScreen = document.getElementById("screen");
let   myAudio;
let   myVideo;

const audioConstraints = {
    audio: true
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
    const localDescription = audioConnection.createAnswer({offerToReceiveAudio: true, offerToReceiveVideo: false});
    console.log('created answer')
    await audioConnection.setLocalDescription(localDescription);
    console.log('local description set')

    const msg = {
        cmd: 'answer',
        target,
        description: audioConnection.localDescription
    };

    ws.send(JSON.stringify(msg));
    createFlash(shareScreenBtn,"info");

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

async function shareScreen () {
    videoConnection = new RTCPeerConnection(config);
    try {
    myVideo = await navigator.mediaDevices.getDisplayMedia({video: true});
} catch (err) {
    console.error(err);
    
}

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

function createFlash (message, level) {
    let flash = `
    <div class="flash flash--${level}">
        <p class="flash__text">${message}</p>
        <button class="flash__remove" onClick="this.parentElement.remove()"> &times;</button>
    </div>
    `
    const div = document.createElement("div")
    div.innerHTML = flash.trim();
    flash = div.firstChild;
    flashes.appendChild(flash);
}

let shareScreenBtn = `
    <button onclick="shareScreen();">Share Screen</button>
`