var config = require('./config');
var ProcessImage = require('./app/processImage');
var paramParser = require('./app/paramParser');
var ProcessRaw = require('./app/processRaw');

exports.handler = function(event, context, callback) {


    const key = event.queryStringParameters.key;
    var processorData = paramParser.processAllParse(['processor'], key);

    if (processorData) {
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
                    body: 'Method not supported'
                });
            }
        }

        var imageProcessor;
        var rawProcessor;
        var params;
        var parseArray;

        if (processorData.processor == 'images') {
            parseArray = ['size','processType'];
            params = paramParser.processAllParse(parseArray, processorData.path);
            imageProcessor = true;
        } else if (processorData.processor == 'raw') {
            rawProcessor = true;
        }

        if (imageProcessor && params) {
            ProcessImage.processImage(key, params, processCallback);
        } else if (rawProcessor) {
            ProcessRaw.processRaw(processorData.path.split('/')[1], key.replace('/',''), processCallback);
        } else {
            callback(null, {
                statusCode: '405',
                body: 'Method not supported'
            });
        }
    } else {
        callback(null, {
            statusCode: '405',
            body: 'Method not supported'
        });
    }

};
