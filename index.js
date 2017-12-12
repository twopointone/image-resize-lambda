var config = require('./config');
var ProcessImage = require('./app/processImage');

exports.handler = function(event, context, callback) {
    console.log(event, config.BASE_DESTINATION_URL);


    const key = event.queryStringParameters.key;
    const match = key.match(/images\/(\d+)x(\d+)\/(.*)\/(.*)/);

    const width = parseInt(match[1], 10);
    const height = parseInt(match[2], 10);

    // crop-type
    const cropType = match[3];
    const originalKey = match[4];

    function processImageCallback(err, data) {
        if (!err){
            callback(null, {
                statusCode: '302',
                headers: { 'location': config.BASE_DESTINATION_URL + key},
                body: ''
            });
        } else {
            callback(null, {
                statusCode: '405',
                body: cropType + ' method not supported'
            });
        }
    }

    ProcessImage.processImage(width, height, originalKey, key, cropType, processImageCallback);


    // applySmartCrop.applySmartCrop(src, 'flower-square.jpg', 128, 128);

};