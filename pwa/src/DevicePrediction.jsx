import React, { Component } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
// Import CSS from App.css
import './App.css';

class DevicePrediction extends Component {
    constructor () {
        super();
    }

    componentDidMount () {
        this.classifier = knnClassifier.create();
        this.webcamElement = document.getElementById('webcam');
        this.net = null;
        this.app();
    }

    async app() {
        console.log('Loading mobilenet..');

        // Load the model.
        this.net = await mobilenetModule.load();
        console.log('Sucessfully loaded model');

        await this.setupWebcam();

        // Reads an image from the webcam and associates it with a specific class
        // index.
        const addExample = classId => {
            // Get the intermediate activation of MobileNet 'conv_preds' and pass that
            // to the KNN classifier.
            const activation = this.net.infer(this.webcamElement, 'conv_preds');

            // Pass the intermediate activation to the classifier.
            this.classifier.addExample(activation, classId);
        };

        // When clicking a button, add an example for that class.
        document.getElementById('class-a').addEventListener('click', () => addExample(0));
        document.getElementById('class-b').addEventListener('click', () => addExample(1));
        document.getElementById('class-c').addEventListener('click', () => addExample(2));

        while (true) {
            if (this.classifier.getNumClasses() > 0) {
                // Get the activation from mobilenet from the webcam.
                const activation = this.net.infer(this.webcamElement, 'conv_preds');
                // Get the most likely class and confidences from the classifier module.
                const result = await this.classifier.predictClass(activation);

                const classes = ['A', 'B', 'C'];
                document.getElementById('console').innerText = `
        prediction: ${classes[result.classIndex]}\n
        probability: ${result.confidences[result.classIndex]}
      `;
            }

            await tf.nextFrame();
        }
    }

    async setupWebcam(){
        return new Promise((resolve, reject) => {
            const navigatorAny = navigator;
            navigator.getUserMedia = navigator.getUserMedia ||
                navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
                navigatorAny.msGetUserMedia;
            if (navigator.getUserMedia) {
                navigator.getUserMedia({video: true},
                    stream => {
                        this.webcamElement.srcObject = stream;
                        this.webcamElement.addEventListener('loadeddata',  () => resolve(), false);
                    },
                    error => reject());
            } else {
                reject();
            }
        });
    }

    render() {
        return (
            <div className="container">
                <div id="console"></div>
                <video autoPlay playsinline muted id="webcam" width="100%" height="100%"></video>
                <button id="class-a">Add A</button>
                <button id="class-b">Add B</button>
                <button id="class-c">Add C</button>
            </div>
        )
    }
}

export default DevicePrediction;