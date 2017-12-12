var request = require('request');
var config = require('../config.js');
var sharp = require('sharp');
var smartcrop = require('smartcrop-sharp');
var storage = require(config.STORAGE);

function processImage(width, height, path, destPath, imageProcessType, processImageCallback) {
    storage.storage.getFile(path, getFileCallback);

    function getFileCallback (err, image) {
        function sharpCallback(err, data, info) {
            if (!err) {
                storage.storage.saveFile(destPath, data, saveFileCallBack);
            }

            function saveFileCallBack () {
                processImageCallback(null, {});
            }
        }

        if (imageProcessType == 'smartcrop') {
            applySmartCrop(image, width, height, sharpCallback);
        } else {
            processImageCallback({}); // call with error;
        }
    }
}


function applySmartCrop(image, width, height, callback) {
    smartcrop.crop(image, { width: width, height: height }).then(function(result) {
        var crop = result.topCrop;
        sharp(image)
            .extract({ width: crop.width, height: crop.height, left: crop.x, top: crop.y })
            .resize(width, height)
            .toBuffer(callback)
    });
}

exports.processImage = processImage;