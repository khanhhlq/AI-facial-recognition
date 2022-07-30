
const video = document.getElementById('videoElm')
const loadFaceAPI = async () => {
    await faceapi.nets.faceLandmark68Net.loadFromUri('../models')
    await faceapi.nets.faceRecognitionNet.loadFromUri('../models')
    await faceapi.nets.tinyFaceDetector.loadFromUri('../models')
    await faceapi.nets.faceExpressionNet.loadFromUri('../models')
    await faceapi.nets.ageGenderNet.loadFromUri('../models')
}
const getCameraStream = () => {
    if (navigator.mediaDevices.getUserMedia){
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(stream => {
                video.srcObject = stream;
            })
    }
}

video.addEventListener('playing', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)

    const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight
    }

    setInterval(async () => {
        const detects = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();

        const resizedDetects = faceapi.resizeResults(detects, displaySize)
        
        canvas.getContext('2d').clearRect(0, 0, displaySize.width, displaySize.height)
        faceapi.draw.drawDetections(canvas, resizedDetects)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetects)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetects)
        resizedDetects.forEach(detection => {
            const box = detection.detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: Math.round(detection.age) + " year old " + detection.gender })
            drawBox.draw(canvas)
        })
          
    }, 300)
})

loadFaceAPI().then(getCameraStream)

