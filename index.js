var config = require('./config');
var ProcessImage = require('./app/processImage');
var paramParser = require('./app/paramParser');
var ProcessRaw = require('./app/processRaw');

exports.handler = function(event, context, callback) {
    const key = event.queryStringParameters.key;
    var processorData = paramParser.processAllParse(['processor'], key);

    function processCallback(err, data) {
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

    if (processorData.processor == 'images') {
        var parseArray = ['size','processType'];
        var params = paramParser.processAllParse(parseArray, processorData.path);
        ProcessImage.processImage(key, params, processCallback);
    } else if (processorData.processor == 'raw') {
        ProcessRaw.getRaw(key, processorData.path, processCallback);
    } else {
        callback(null, {
            statusCode: '404'
        })
    }

};
