var config = require('../../config');
const path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

function getFile(sourcePath, callback) {
    var filePath = path.join(config.INPUT_IMAGE_SOURCE, sourcePath);

    // Always read file and return the buffered data as other storage sources.
    fs.readFile(filePath, function (err, imageData) {
        if (err) {
            callback(err);
        }
        callback(null, imageData);
    })
}

function saveFile(destPath, imageBufferData, fileInfo, saveFileCallBack) {
    var destFilePath = path.join(config.DESTINATION_PATH, destPath);

    // create the dir
    mkdirp.sync(path.dirname(destFilePath));

    fs.writeFile(destFilePath, imageBufferData, saveFileCallBack);
}

exports.storage = {
    'getFile': getFile,
    'saveFile': saveFile
};