import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
const classifier = knnClassifier.create();

let net;
const promises = [];

export async function loadModel() {
    net = await mobilenet.load();
    return net;
}

export function trainModel(callback){
    fetch('https://localhost/images')
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            myJson.forEach((image) => {
                promises.push(train(image));
            });
            Promise.all(promises).then(()=> {
                alert('starting');
                callback();
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
        img.crossOrigin = "anonymous";
        img.src = "https://localhost" + image;
    })
}

export function addToModel(img) {
    img = tf.browser.fromPixels(img);
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(img, "conv_preds");

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, 1);
}

export async function predictClass(webcamElement) {
    if (classifier.getNumClasses() > 0) {
        // Get the activation from mobilenet from the webcam.
        const activation = net.infer(webcamElement, 'conv_preds');
        // Get the most likely class and confidences from the classifier module.
        const result = await classifier.predictClass(activation);
        return result;
    }
}
