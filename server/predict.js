const fs = require("fs");

const tf = require('@tensorflow/tfjs');
const knnClassifier = require('@tensorflow-models/knn-classifier');
const mobilenet = require('@tensorflow-models/mobilenet');

const classifier = knnClassifier.create();

const classes = require('./devices_classes');

let model;
(async function() {
    // model = await tf.loadLayersModel('://devices-model');
    model = await mobilenet.load();
    trainModel();
})();

function trainModel(){
    readFromDisk("../../data/vva3", classes.DEVICES_CLASSES[0]);
    readFromDisk("../../data/fr645", classes.DEVICES_CLASSES[1]);
    readFromDisk("../../data/fenix5", classes.DEVICES_CLASSES[2]);
}

function readFromDisk(path, classId){
    fs.readdir(path, (err, entries) => {
        if (!err) {
            entries.forEach(image => {
                fs.readFile(image, function (err, data) {
                    if (err) throw err;
        
                    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
                    // to the KNN classifier.
                    const activation = model.infer(data, "conv_preds");

                    // Pass the intermediate activation to the classifier.
                    classifier.addExample(activation, classId);
                  });
            })
        }
    });
}

async function classifyImage(image) {
    const processedTensor = getProcessedTensor(image);
    
    let predictions = await model.predict(processedTensor).data();
    
    let top5 = Array.from(predictions)
        .map((p, i) => ({
            probability: p,
            className: classes.DEVICES_CLASSES[i]
        }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 5);
    console.log('top 5 predictions', top5);
}

function getProcessedTensor(image){
    let tensor = tf.fromPixels(image)
        .resizeNearestNeighbor([224, 224])
        .toFloat();

    // zero mean centering each color channel
    // divide to 255
    let meanImageNetRGB = {
        red: 123.68,
        green: 116.779,
        blue: 103.939
    };

    let indices = [
        tf.tensor1d([0], "int32"),
        tf.tensor1d([1], "int32"),
        tf.tensor1d([2], "int32")
    ];

    let centeredRGB = {
        red: tf.gather(tensor, indices[0], 2)
                .sub(tf.scalar(meanImageNetRGB.red))
                .reshape([50176]), // 224 x 224
        green: tf.gather(tensor, indices[1], 2)
                .sub(tf.scalar(meanImageNetRGB.green))
                .reshape([50176]),
        blue: tf.gather(tensor, indices[1], 2)
                .sub(tf.scalar(meanImageNetRGB.blue))
                .reshape([50176])
    }

    let processedTensor = tf.stack([centeredRGB.red, centeredRGB.green, centeredRGB.blue], 1)
        .reshape([224, 224, 3])
        .reverse(2) // [R, G, B] => [B, R, G]
        .expandDims();

    return processedTensor;
}


