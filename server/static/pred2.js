const classifier = knnClassifier.create();

let net;
loadModel();
const promises = [];

async function loadModel() {
    net = await mobilenet.load();
    trainModel();
}

function trainModel(){
    fetch('https://localhost/images')
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            myJson.forEach((image) => {
                promises.push(train(image));
            });
            Promise.all(promises).then(()=> {
                startRecognition();
                alert('starting');
            });
        });
}

function train(image) {
    return new Promise((resolve) => {
        let img = new Image();
        img.onload = function () {
            addToModel(img);
            resolve()
        };
        img.src = image;
        document.body.appendChild(img);
    })
}

function addToModel(img) {
    img = tf.browser.fromPixels(img);
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(img, "conv_preds");

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, 1);
}

async function startRecognition() {
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