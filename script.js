// fichier script.js
let mediaRecorder;
let recordedBlobs;

const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo = document.querySelector('video#recorded');
const recordButton = document.querySelector('button#record');
const playButton = document.querySelector("button#play");
const downloadButton = document.querySelector("button#download");

document.querySelector("button#start").addEventListener("click" ,async function(){
    const hasEchoCancellation = document.querySelector('#echoCancellation').checked;

    const constraints = {
        audio: {
            echoCancellation: {exact: hasEchoCancellation}
        },
        video: {
            width: 1280, height: 720
        }
    }

    await init(constraints);
});

async function init(constraints){
    try{
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        handleSuccess(stream);
    } catch(e){
        errorMsgElement.innerHTML = `navigator.getUserMedia.error:${e.toString()}`;
    }
}

function handleSuccess(stream) {
    recordButton.disabled = false;

    window.stream = stream;
    const gumVideo = document.querySelector('video#gum');
    gumVideo.srcObject = stream;

}

recordButton.addEventListener('click', () => {
    if(recordButton.textContent === 'Record'){
        startRecording();
    } else {
        stopRecording()
    }
});

function stopRecording() {
    mediaRecorder.stop();
    recordButton.textContent = 'Record';
    playButton.disabled = false;
    downloadButton.disabled = false;

}

function startRecording(){
    recordedBlobs = [];
    let options = {
        mimeType: 'video/webm'
        // mimeType: 'video/webm;codecs=vp9,opus'
    }
    try {
        mediaRecorder = new MediaRecorder(window.stream, options);
    } catch(e) {
        console.log(e);
        errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
        return;
    }

    recordButton.textContent = 'Stop Recording';
    playButton.disabled = true;
    downloadButton.disabled = true;

    mediaRecorder.onstop = (event) => {
        console.log('Recorder stopped: ', event);
        console.log('Recorded Blobs: ', recordedBlobs);
    }

    mediaRecorder.ondataavailable = handleDataAvailable;

    mediaRecorder.start();
    console.log('MediaRecorder started', mediaRecorder);
}

downloadButton.addEventListener('click', () => {
    const blob = new Blob(recordedBlobs, {type: 'video/mp4'});
    // const blob = new Blob(recordedBlobs, {type: 'video/webm;codecs=vp9,opus'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.mp4';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
});

function handleDataAvailable(event){
    if(event.data && event.data.size > 0){
        recordedBlobs.push(event.data);
    }
}

playButton.addEventListener('click', () => {
    // const superBuffer = new Blob(recordedBlobs, {type: 'video/webm;codecs=vp9,opus'});
    const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});

    recordedVideo.src = null;
    recordedVideo.srcObject = null;
    try {
        recordedVideo.src = window.URL.createObjectURL(superBuffer);
    } catch(error) {
        console.log("objectUrl=> ", error);
    }
    recordedVideo.controls = true;
    // try {
        recordedVideo.play();
    // } catch(e) {
    //     console.log(e);
    // }
});
