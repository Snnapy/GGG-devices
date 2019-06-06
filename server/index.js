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

app.get('/images', function (req, res) {
    getImages(res);
});

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(443, () => {
    console.log('listening on 443')
});

async function getImages(res) {
    let imagesArray = [];
    let vva3Paths = fs.readdirSync("./static/vva3");
    let fr645Paths = fs.readdirSync("./static/fr645");
    let fenix5Paths = fs.readdirSync("./static/fenix5");

    imagesArray = imagesArray.concat(vva3Paths.map((img)=> "/vva3/" + img));
    imagesArray = imagesArray.concat(fr645Paths.map((img)=> "/fr645/" + img));
    imagesArray = imagesArray.concat(fenix5Paths.map((img)=> "/fenix5/" + img));

    res.send(imagesArray);
}

function saveModel(req, res){
    var model=req.body;
    console.log(model);
}