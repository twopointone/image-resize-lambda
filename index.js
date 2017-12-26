var config = require('./config');
var ProcessImage = require('./app/processImage');

function resolveParamsFromKey(key) {
    const regexMatch = key.match(/images\/((\d+)x(\d+)?\/)?([a-zA-Z]+)\/(.*)/);

    if (regexMatch && regexMatch.length > 0) {
        const width = parseInt(regexMatch[2], 10);

        // pass height as undefined or null if not present to auto calculate.
        const height = regexMatch[3] ? parseInt(regexMatch[3], 10) : null;

        // crop-type
        const cropType = regexMatch[4];
        const inputBucketKey = regexMatch[5];

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
    const key = event.queryStringParameters.key;
    var params = resolveParamsFromKey(key);

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
                body: params.cropType + ' Method not supported'
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
