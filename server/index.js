const fs = require("fs");
const https = require('https')
const express = require("express");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(express.static('static'));

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app).listen(443, () => {console.log('listening on 443')});


app.get('/images', (req, res) => {    
    getImages(res);
});

async function getImages(res) {
    const imagesArray = [];
    const vva3Paths = await readFromDisk("./static/vva3");
    const fr645Paths = await readFromDisk("./static/fr645");
    const fenix5Paths = await readFromDisk("./static/fenix5");

    imagesArray.concat(vva3Paths);
    imagesArray.concat(fr645Paths);
    imagesArray.concat(fenix5Paths);
    
    res.send(imagesArray);
}

async function readFromDisk(path){
    return fs.readdir(path, (err, entries) => {
        if (!err) {
            return entries;
        }
    });
}