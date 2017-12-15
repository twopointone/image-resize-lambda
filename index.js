var config = require('./config');
var ProcessImage = require('./app/processImage');

function resolveParamsFromKey(key) {
    const key = event.queryStringParameters.key;
    const match = key.match(/images\/(\d+)x(\d+)\/(\w+)\/(.*)/);

    if (match.length > 0) {
        const width = parseInt(match[1], 10);
        const height = parseInt(match[2], 10);

        // crop-type
        const cropType = match[3];
        const inputBucketKey = match[4];

        return {
            size: {
                width: width,
                height: height
            },
            cropType: cropType,
            inputBucketKey: inputBucketKey,
            destPath: key.replace('/', '')  // remove the first '/' from the bucket
        }
    } else {
        return null;
    }
}

exports.handler = function(event, context, callback) {
    var params = resolveParamsFromKey(event.queryStringParameters.key);

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
                body: cropType + ' Method not supported'
            });
        }
    }

    if ( params ){
        ProcessImage.processImage(params.size, params.inputBucketKey,
            params.destPath, params.cropType, processImageCallback);
    } else {
        callback(null, {
            statusCode: '404'
        })
    }

};