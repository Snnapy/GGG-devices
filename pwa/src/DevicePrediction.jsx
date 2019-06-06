import React, {Component} from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
// Import CSS from App.css
import './App.css';

class DevicePrediction extends Component {
    constructor() {
        super();

        this.cameraIds = [];

        this.state = {
            activeCameraIndex: null
        };
    }

    componentDidMount() {
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

                console.log(activation);

                const classes = ['A', 'B', 'C'];
                document.getElementById('result').innerHTML = `
                <div class="result-container">
                    <p class="prediction">prediction: ${classes[result.classIndex]}</p>
                    <p class="probability">probability: ${result.confidences[result.classIndex]}</p>
                    <span class="chevron bottom"    />
                </div>`;
            }

            await tf.nextFrame();
        }
    }

    async setupWebcam() {
        navigator.mediaDevices.enumerateDevices().then((e) => {
            this.gotSources(e);

            console.log(JSON.stringify(this.cameraIds));

            this.setState({
                activeCameraIndex: 0
            });
        });
    }

    startCamera(index) {
        if (window.stream) {
            window.stream.getTracks().forEach(function (track) {
                track.stop();
            });
        }

        navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: {exact: this.cameraIds[index]}
            }
        }).then(stream => {
            window.stream = stream;
            this.webcamElement.srcObject = stream;
        });
    }

    gotSources(sourceInfos) {
        for (var i = 0; i !== sourceInfos.length; ++i) {
            var sourceInfo = sourceInfos[i];

            if (sourceInfo.kind === 'videoinput') {
                this.cameraIds.push(sourceInfo.deviceId);
            }
        }
    }

    componentDidUpdate() {
        if(this.state.activeCameraIndex !== null) {
            this.startCamera(this.state.activeCameraIndex);
        }
    }

    onCameraChange() {
        //
        // if (window.stream) {
        //     window.stream.getTracks().forEach(function (track) {
        //         track.stop();
        //     });
        // }
        // return;

        this.setState({
            activeCameraIndex: this.cameraIds.length === this.state.activeCameraIndex + 1 ? 0 : this.state.activeCameraIndex + 1
        });
    }

    render() {
        return (
            <div className="app-container">
                <div className="header">
                    <div className="logo-container"/>

                    <button onClick={this.onCameraChange.bind(this)}>Camera v1.1</button>
                </div>
                <div className="btn-container">
                    <button id="class-a">Add A</button>
                    <button id="class-b">Add B</button>
                    <button id="class-c">Add C</button>
                </div>
                <video autoPlay muted id="webcam" width="100%" height="100%"></video>
                <div id="result"></div>
            </div>
        )
    }
}

export default DevicePrediction;