let classifier;
const webcamElement = document.getElementById('webcam');
let net;

let recordingButton = -1;
let interval;

async function app() {
    console.log('Loading mobilenet..');

    let net = localStorage.getItem('net');
    if(!net){
        net = await mobilenet.load();
    } else {
        net = JSON.parse(net);
    }

    let classifier = localStorage.getItem('classifier');
    if(!classifier){
        classifier = knnClassifier.create();
    } else {
        classifier = JSON.parse(classifier);
    }
    // Load the model.
    console.log('Sucessfully loaded model');

    await setupWebcam();

    // Reads an image from the webcam and associates it with a specific class
    // index.
    const addExample = classId => {
        if(recordingButton === classId){
            clearInterval(interval);
            recordingButton = -1;
            document.getElementById('class-' + classId).innerHTML = 'class-' + classId;
            localStorage.setItem('net', JSON.stringify(net));
            localStorage.setItem('classifier', JSON.stringify(classifier));
        } else {
            interval = setInterval(()=>{
                recordingButton = classId;
                // Get the intermediate activation of MobileNet 'conv_preds' and pass that
                // to the KNN classifier.
                const activation = net.infer(webcamElement, 'conv_preds');

                // Pass the intermediate activation to the classifier.
                classifier.addExample(activation, classId);
            }, 300)
            document.getElementById('class-' + classId).innerHTML = 'Stop class-' + classId;
        }
    };



    // When clicking a button, add an example for that class.
    document.getElementById('class-0').addEventListener('click', () => addExample(0));
    document.getElementById('class-1').addEventListener('click', () => addExample(1));
    document.getElementById('class-2').addEventListener('click', () => addExample(2));

    while (true) {
        if (classifier.getNumClasses() > 0) {
            // Get the activation from mobilenet from the webcam.
            const activation = net.infer(webcamElement, 'conv_preds');
            // Get the most likely class and confidences from the classifier module.
            const result = await classifier.predictClass(activation);

            const classes = ['A', 'B', 'C'];
            document.getElementById('console').innerText = `
        prediction: ${classes[result.classIndex]}\n
        probability: ${result.confidences[result.classIndex]}
      `;
        }

        await tf.nextFrame();
    }
}

async function setupWebcam() {
    return new Promise((resolve, reject) => {
        const navigatorAny = navigator;
        navigator.getUserMedia = navigator.getUserMedia ||
            navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
            navigatorAny.msGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true},
                stream => {
                    webcamElement.srcObject = stream;
                    webcamElement.addEventListener('loadeddata',  () => resolve(), false);
                },
                error => reject());
        } else {
            reject();
        }
    });
}

app();