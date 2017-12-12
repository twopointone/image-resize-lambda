var config = require('../../config');
var AWS = require('aws-sdk');

// make s3 calls in sync
var S3 = new AWS.S3();

if (!(config.INPUT_BUCKET && config.OUTPUT_BUCKET)) {
    throw Error("Configure both INPUT_BUCKET and OUTPUT_BUCKET")
}

function getFile(key, callback) {
    S3.getObject({ Bucket: config.INPUT_BUCKET, Key: key }, function(err, data) {
        if(!err){
            callback(err, data.Body);
        } else {
            callback(err);
        }
    });
}

function saveFile(destKey, imageBufferData, saveFileCallBack) {
    S3.putObject({
        Body: imageBufferData,
        Bucket: config.OUTPUT_BUCKET,
        Key: destKey
    }, function(err, data) {
        saveFileCallBack(err, data);
    });
}

exports.storage = {
    'getFile': getFile,
    'saveFile': saveFile
};