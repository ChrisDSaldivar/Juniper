// 'use strict';
// document.querySelector('body').onload = initParams;

// const ws = new WebSocket('wss://juniper.beer');
// window.onunload = window.onbeforeunload = () => {
//     ws.close();
// };

// // Element refs
// const videoElem = document.getElementById("screen");
// const audioElem = document.getElementById("voice");
// let audioStream;

// let id;
// let watch;

// ws.commands = {
//     broadcast,
//     watch,
// };

// ws.onopen = (event) => {
//     console.log("WebSocket is open now.");
//     ws.send(JSON.stringify({PING: "PING"}));
// };
// ws.onmessage = (event) => {
//     const msg = JSON.parse(event.data);
//     console.log(`WebSocket message received: ${JSON.stringify(msg, null, 2)}`);
//     const cmd = msg.cmd;
//     if (ws.commands[cmd]) {
//         ws.commands[cmd](event);
//     }
// }
// ws.onclose = (event) => {
//     console.log(`Websocket closed!`)
// }

// document.getElementById('shareScreen--button').onclick = shareScreen;
// document.getElementById('stopCapture--button').onclick = stopCapture;

// function initParams(){
//     const urlParams = new URLSearchParams(window.location.search);
//     const name = urlParams.get('name');
//     id = urlParams.get('id');
//     console.log(id)
//     let firstname = document.getElementById('firstname');
//     firstname.textContent = name;
// }

// async function shareScreen () {
//     startCapture();
// }

// async function offer (description) {
//     let proctorAudioCxn = new RTCPeerConnection(config);
//     await proctorAudioCxn.setRemoteDescription(description);

//     await startCapture();
//     await audioStream.getTracks().forEach(track => proctorAudioCxn.addTrack(track, audioStream));

//     const sdp = await proctorAudioCxn.createAnswer();
//     await proctorAudioCxn.setLocalDescription(sdp);
    
//     const msg = {
//         cmd: 'answer',
//         localDescription: proctorAudioCxn.localDescription
//     };
//     ws.send(JSON.stringify(msg));
// }

// async function startCapture() {
//     try {
//         const displayMediaOptions = {
//             video: {
//                 cursor: "motion"
//             },
//             audio: true,
//         };
//         videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
//         audioStream = await navigator.mediaDevices.getUserMedia({
//             audio: {
//                 echoCancellation: true,
//                 noiseSuppression: true,
//                 sampleRate: 44100
//             },
//             video: false,
//         });
//         videoElem.srcObject.getVideoTracks().forEach((track) => {
//             track.contentHint = 'text';
//         });
//     } catch(err) {
//         console.error("Error: " + err);
//     }
// }

// function stopCapture (evt) {
//     let videoTracks = videoElem.srcObject.getTracks();
//     console.log(audioElem.srcObject)
//     let audioTracks = audioElem.srcObject.getTracks();
  
//     videoTracks.forEach(track => track.stop());
//     videoElem.srcObject = null;

//     audioTracks.forEach(track => track.stop());
//     audioElem.srcObject = null;
// }

// /*

//     Broadcast Code

// */
// const peerConnections = {};
// const config = {
//   iceServers: [
//     {
//       urls: ["stun:stun.l.google.com:19302"]
//     }
//   ]
// }

// function answer (id, description) {
//     peerConnections[id].setRemoteDescription(description);
// };

// function broadcast (id) {
//     const videoConnection = new RTCPeerConnection(config);
//     const audioConnection = new RTCPeerConnection(config);
//     peerConnections[id] = videoConnection;
  
//     let videoStream = videoElement.srcObject;
//     videoStream.getTracks().forEach(track => videoConnection.addTrack(track, videoStream));

//     audioStream.getTracks().forEach(track => audioConnection.addTrack(track, audioStream));
  
//     videoConnection.onicecandidate = event => {
//         if (event.candidate) {
//             const msg = {
//                 cmd: "candidate", 
//                 target: id, 
//                 candidate: event.candidate,
//                 videoStream: true,
//             };
//             ws.send(JSON.stringify(msg));
//         }
//     };
//     audio.connection.onicecandidate = event => {
//         if (event.candidate) {
//             const msg = {
//                 cmd: "candidate", 
//                 target: id, 
//                 candidate: event.candidate,
//                 audioStream: true,
//             };
//             ws.send(JSON.stringify(msg));
//         }
//     };
  
//     videoConnection
//         .createOffer()
//         .then(sdp => videoConnection.setLocalDescription(sdp))
//         .then(() => {
//             const msg = {
//                 cmd: "offer",
//                 target: id,
//                 connection: videoConnection.localDescription
//             };
//             ws.send(JSON.stringify(msg));
//         });
//     audioConnection
//         .createOffer()
//         .then(sdp => audioConnection.setLocalDescription(sdp))
//         .then(() => {
//             const msg = {
//                 cmd: "offer",
//                 studentId: id,
//                 connection: audioConnection.localDescription
//             }
//             ws.send(JSON.stringify(msg));
//         });
// };

  
// // function disconnectPeer (id) {
// //     peerConnections[id].close();
// //     delete peerConnections[id];
// // };





// // socket.on("candidate", (id, candidate) => {
// //   peerConnection
// //     .addIceCandidate(new RTCIceCandidate(candidate))
// //     .catch(e => console.error(e));
// // });

// // socket.on("connect", () => {
// //   socket.emit("watcher");
// // });

// // socket.on("broadcaster", () => {
// //   socket.emit("watcher");
// // });

// // socket.on("disconnectPeer", () => {
// //   peerConnection.close();
// // });

// // window.onunload = window.onbeforeunload = () => {
// //   socket.close();
// // };