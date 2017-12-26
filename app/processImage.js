var async = require('async');
var request = require('request');
var config = require('../config.js');
var sharp = require('sharp');
var smartcrop = require('smartcrop-sharp');
var storage = require(config.STORAGE);


const functionMapping = {
    'smartcrop': applySmartCrop,
    'crop': applyCrop,
    'cover': applyCoverResize,
    'raw': rawImage
};

function processImage(size, path, destPath, imageProcessType, processImageCallback) {
    // Run all the steps in sync with response of 1 step acting as input for other.
    // avoiding the callback structure
    // https://caolan.github.io/async/docs.html#waterfall
    async.waterfall([
        function(callback) {
            // Get the file from the disk or S3
            storage.storage.getFile(path, callback);
        },
        function(image, callback) {
            // Process the image as per the process type
            var cropFunction = getCropFunction(imageProcessType);
            if (cropFunction) {
                cropFunction(image, size, callback);
            } else {
                callback({}); // call with err
            }
        },
        function(data, fileInfo, callback) {
            // save file to S3
            storage.storage.saveFile(destPath, data, fileInfo, callback);
        }
    ], function(err, result) {
        // this function is always executed both in case of err and success as well
        processImageCallback(err, result);
    });
}

function getCropFunction(cropType) {
    return functionMapping[cropType.toLowerCase()]
}


function applySmartCrop(image, cropSize, callback) {
  const img = sharp(image);

  var height = cropSize.height;
  if (!height){
    var asp_ratio;

    img
    .metadata()
    .then(function(metadata) {
      asp_ratio = metadata.width/metadata.height;
      cropSize.height = Math.round(cropSize.width/asp_ratio);
    })
  }

  smartcrop.crop(image, cropSize).then(function(result) {
      var crop = result.topCrop;
      img
        .extract({ width: crop.width, height: crop.height, left: crop.x, top: crop.y })
        .resize(cropSize.width, cropSize.height)
        .toBuffer(callback)
  }, callback);
}

function applyCrop(image, cropSize, callback) {
  const img = sharp(image);

  if (!cropSize.height){
    var asp_ratio;

    img
    .metadata()
    .then(function(metadata) {
      asp_ratio = metadata.width/metadata.height;
      cropSize.height = Math.round(cropSize.width/asp_ratio);
    })
  }

  img
    .resize(cropSize.width, cropSize.height)
    .toBuffer(callback)
}

function applyCoverResize(image, cropSize, callback) {
  const img = sharp(image);

  if (!cropSize.height){
    var asp_ratio;

    img
    .metadata()
    .then(function(metadata) {
      asp_ratio = metadata.width/metadata.height;
      cropSize.height = Math.round(cropSize.width/asp_ratio);
    })
  }

  img
    .resize(cropSize.width, cropSize.height)
    .max()
    .toBuffer(callback)
}

function rawImage(image, cropSize, callback) {
    if (cropSize.width || cropSize.height) {
        callback({}); // raise error if height or width is provided with rawType
        return ;
    }
    callback(null, image, {});
}

exports.processImage = processImage;
