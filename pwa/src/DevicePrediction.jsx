import React, {Component} from 'react';
import * as tf from '@tensorflow/tfjs';
// Import CSS from App.css
import './App.css';
import {loadModel, trainModel, predictClass, DEVICES_CLASSES} from './trainer';

class DevicePrediction extends Component {
    constructor() {
        super();

        this.cameraIds = [];

        this.state = {
            activeCameraIndex: null
        };
    }

    componentDidMount() {
        this.webcamElement = document.getElementById('webcam');
        loadModel().then(() => {
            trainModel(() => {
                this.app();
            });
        });
    }

    async app() {
        await this.setupWebcam();

        while (true) {
            const result = await predictClass(this.webcamElement);

            if (!result) {
                await tf.nextFrame();
            } else {
                const classes = Object.values(DEVICES_CLASSES);
                document.getElementById('result').innerHTML = `
                <div class="result-container">
                    <p class="prediction">prediction: ${classes[result.label]}</p>
                    <p class="probability">probability: ${result.confidences[result.label]}</p>
                    <span class="chevron bottom"    />
                </div>`;

                await tf.nextFrame();
            }
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
                deviceId: {exact: this.cameraIds[index]},
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
        this.setState({
            activeCameraIndex: this.cameraIds.length === this.state.activeCameraIndex + 1 ? 0 : this.state.activeCameraIndex + 1
        });
    }

    render() {
        return (
            <div className="app-container">
                <div className="header">
                    <div className="logo-container"/>

                    <button onClick={this.onCameraChange.bind(this)}>Camera v1.2</button>
                </div>
                <video autoPlay muted id="webcam" width="100%" height="100%"></video>
                <div id="result"></div>
            </div>
        )
    }
}

export default DevicePrediction;