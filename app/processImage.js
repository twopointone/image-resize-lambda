var async = require('async');
var request = require('request');
var config = require('../config.js');
var sharp = require('sharp');
var smartcrop = require('smartcrop-sharp');
var storage = require(config.STORAGE);

function processImage(width, height, path, destPath, imageProcessType, processImageCallback) {

    // Run all the steps in sync with response of 1 step acting as input for other.
    // avoiding the callback structure
    // https://caolan.github.io/async/docs.html#waterfall
    async.waterfall([
        function (callback) {
            // Get the file from the disk or S3
            storage.storage.getFile(path, callback);
        },
        function(image, callback){
            // Process the image as per the process type
            if (imageProcessType == 'smartcrop') {
                applySmartCrop(image, width, height, callback);
            } else {
                callback({}); // call with err
            }
        },
        function( data, fileInfo, callback){
            // save file to S3
            storage.storage.saveFile(destPath, data, fileInfo, callback);
        }
    ], function (err, result) {
        // this function is always executed both in case of err and succcess as well
        processImageCallback(err, result);
    });
}


function applySmartCrop(image, width, height, callback) {
    smartcrop.crop(image, { width: width, height: height }).then(function(result) {
        var crop = result.topCrop;
        sharp(image)
            .extract({ width: crop.width, height: crop.height, left: crop.x, top: crop.y })
            .resize(width, height)
            .toBuffer(callback)
    }, callback);
}

exports.processImage = processImage;