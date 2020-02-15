// https://github.com/cozmo/jsQR/tree/master/docs

var qr_video = null;
var qr_stream = null;
var qr_handler = null;

function qr_onqrscan(value) {
    jQuery("#codice").val(value.data)
    click_qr_quit()
}

function qr_hide(canvasElement, canvasContainer){
    var hidden = true;
    canvasElement.hidden = hidden;
    canvasContainer.hidden = hidden;
}

function qr_show(canvasElement, canvasContainer){
    var hidden = false;
    canvasElement.hidden = hidden;
    canvasContainer.hidden = hidden;
}

function click_qr_start() {
    var WIDTH = 300;
    var HEIGHT = 300;

    qr_video = document.createElement("video");
    var canvasElement = document.getElementById("canvas");
    var canvasContainer = document.getElementById("canvas-container");
    var canvas = canvasElement.getContext("2d");

    // Use facingMode: environment to attemt to get the front camera on phones
    var constraints = {
        video:{
            facingMode: { exact: "environment" },
            width: { min: 100, ideal: WIDTH, max: WIDTH },
            height: { min: 100, ideal: HEIGHT, max: HEIGHT }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream)
    {
        qr_stream = stream
        qr_video.srcObject = stream;
        // required to tell iOS safari we don't want fullscreen
        qr_video.setAttribute("playsinline", true);
        qr_video.play();
        qr_handler = requestAnimationFrame(tick);
    }).catch(err=>{
        alert("Impossibile accedere alla fotocamera.\n" +
            "REQUISITI:\n" +
            "1) Utilizzare questa funzione su un dispositivo mobile\n" +
            "2) Autorizzare la pagina ad accedere alla fotocamera" );
        console.error(err)
    });

    function tick() {

        if (qr_video.readyState === qr_video.HAVE_ENOUGH_DATA) {
            qr_show(canvasElement, canvasContainer)
            canvasElement.height = qr_video.videoHeight;
            canvasElement.width = qr_video.videoWidth;
            canvas.drawImage(qr_video, 0, 0, canvasElement.width, canvasElement.height);
            var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            var code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
            if (code) {
                console.log("code")
                console.log(code)
                qr_onqrscan(code)
            }
        }

        if(qr_handler){
            qr_handler = requestAnimationFrame(tick);
        }
    }
}

function click_qr_quit() {
    console.log("Chiudo tutto...")

    cancelAnimationFrame(qr_handler);
    qr_handler = null

    qr_video.pause()
    qr_video.src=null;
    qr_video.style.display = 'none';

    qr_stream.getTracks().forEach(function(track) {
        track.stop();
    });

    var canvasElement = document.getElementById("canvas");
    var canvasContainer = document.getElementById("canvas-container");
    qr_hide(canvasElement, canvasContainer)
}


