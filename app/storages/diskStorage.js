var config = require('../../config');
const path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

function getFile(sourcePath, callback) {
    callback(null, path.join(config.INPUT_IMAGE_SOURCE, sourcePath));
}

function saveFile(destPath, imageBufferData, saveFileCallBack) {
    var destFilePath = path.join(config.DESTINATION_PATH, destPath);

    // create the dir
    mkdirp.sync(path.dirname(destFilePath));

    fs.writeFile(destFilePath, imageBufferData, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

exports.storage = {
    'getFile': getFile,
    'saveFile': saveFile
};