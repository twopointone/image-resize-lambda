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
            storage.storage.getFile(path, callback);
        },
        function(file, callback) {
            getRaw(file, callback)
        },
        function(data, fileInfo, callback) {
            // save file to S3
            storage.storage.saveFile(destPath, data, fileInfo, callback);
        }
    ], function(err, result) {
        // this function is always executed both in case of err and success as well
        callback(err, result);
    });
}

function getRaw(file, callback) {
    callback(null, file, {});
}

exports.processRaw = processRaw;
