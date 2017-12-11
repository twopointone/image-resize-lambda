
var config = require('./config')
var applySmartCrop = require('./app/imageResize')
// const AWS = require('aws-sdk');
const BUCKET = process.env.BUCKET;
const URL = process.env.URL;

exports.handler = function(event, context, callback) {
    console.log(event, config.BASE_DESTINATION_URL);


    const key = event.queryStringParameters.key;
    const match = key.match(/(\d+)x(\d+):(.*)\/(.*)/);
    const width = parseInt(match[1], 10);
    const height = parseInt(match[2], 10);

    // crop-type
    const cropType = match[3];
    const originalKey = match[4];


    callback({
        statusCode: '302',
        headers: { 'location': config.BASE_DESTINATION_URL + '/200x200/flower.jpg' },
        body: ''
    });

}