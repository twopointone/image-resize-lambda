var async = require('async');
var config = require('../config.js');
var storage = require(config.STORAGE);

function processRaw(path, destPath, callback) {

    // Run all the steps in sync with response of 1 step acting as input for other.
    // avoiding the callback structure
    // https://caolan.github.io/async/docs.html#waterfall
    async.waterfall([
        function(callback) {
            // Get the file from the disk or S3
            console.log("Calling storage processor");
            storage.storage.getFile(path, callback);
        },
        function(file, callback) {
            console.log("Getting raw file");
            getRaw(file, callback)
        },
        function(data, fileInfo, callback) {
            // save file to S3
            console.log("Saving file to storage");
            storage.storage.saveFile(destPath, data, fileInfo, callback);
        }
    ], function(err, data) {
        // this function is always executed both in case of err and success as well
        console.log("Error raised while Processing raw File, Error=", err, ", data=", data);
        callback(err, data);
    });
}

function getRaw(file, callback) {
    callback(null, file, {});
}

exports.processRaw = processRaw;
