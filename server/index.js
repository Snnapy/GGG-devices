const fs = require("fs");
const https = require('https')
const express = require("express");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    next();
});

app.use(express.static('static'));

// app.get('/images', function (req, res) {
//     getImages(res);
// });

app.get('/images/:deviceName', function(req, res) {
    const deviceName = req.params.deviceName;
    getImages(res, deviceName);
})

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(443, () => {
    console.log('listening on 443')
});

async function getImages(res, deviceName) {
    let paths = fs.readdirSync(`./static/${deviceName}`);
    const imagesArray = paths.map((img)=> `/${deviceName}/${img}`);
    res.send(imagesArray);
}

function saveModel(req, res){
    var model=req.body;
    console.log(model);
}