var config = require('../../config');
var AWS = require('aws-sdk');
const path = require('path');
var mime = require('mime-types');

// make s3 calls in sync
var S3 = new AWS.S3();

if (!(config.INPUT_BUCKET && config.OUTPUT_BUCKET)) {
    throw Error("Configure both INPUT_BUCKET and OUTPUT_BUCKET")
}

function getFile(key, callback) {
    S3.getObject({ Bucket: config.INPUT_BUCKET, Key: key }, function(err, data) {
        if(!err){
            console.log("Fetched file from s3 for key=", key);
            callback(err, data.Body);
        } else {
            console.log("Error while fetching data from s3 for key=", key, ", error=", err, ", data=", data);
            callback(err);
        }
    });
}

function saveFile(destKey, imageBufferData, fileInfo, saveFileCallBack) {
    var contentType = mime.lookup(fileInfo.format);
    console.log("Saving file to s3. destKey=", destKey, " fileInfo=", fileInfo, ", contentType=", contentType);
    if (!contentType) {
        var fileExt = path.extname('destKey');
        contentType = mime.lookup(fileExt);
        console.log("content type not found from fileInfo. using file Extension=", fileExt, ", contentType=", contentType);
    }

    S3.putObject({
        Body: imageBufferData,
        Bucket: config.OUTPUT_BUCKET,
        Key: destKey,
        CacheControl: "max-age=" + config.S3_MAX_AGE,
        ContentType: contentType ? contentType : ''
    }, function (err, data) {
        console.log("Error while saving file to s3. Error=", err, ", data=", data);
        saveFileCallBack(err, data)
    });
}

exports.storage = {
    'getFile': getFile,
    'saveFile': saveFile
};
