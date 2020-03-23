document.getElementById('startRecording').onclick = startRecording;
document.getElementById('stopRecording').onclick  = stopRecording;

let videoStream, mediaRecorder;
let chunks = [];
let video = document.getElementById('playback');
let download = document.getElementById('download');

async function startRecording (event) {
    chunks = [];
    download.classList.add("disabled");
    videoStream = await navigator.mediaDevices.getDisplayMedia({video:true});
    const options = {
        videoBitsPerSecond : 25000000,
        mimeType : 'video/webm'
    };
    mediaRecorder = new MediaRecorder(videoStream, options);
    mediaRecorder.ondataavailable = (e) => {
        console.log('data available')
        chunks.push(e.data);
    };
    mediaRecorder.onstop = function(e) {
        console.log("data available after MediaRecorder.stop() called.");
        
        video.controls = true;
        let blob = new Blob(chunks, { 'type' : 'video/webm;' });
        let videoURL = window.URL.createObjectURL(blob);
        video.src = videoURL;
        download.href = videoURL;
        download.classList.remove('disabled');
        console.log("recorder stopped");
    };
    mediaRecorder.start();
}

function stopRecording () {
    mediaRecorder.stop();
}