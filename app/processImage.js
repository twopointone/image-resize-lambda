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
    'blurredframe': applyBlurredFrame
};

//params includes size, path, destPath, imageProcessType
function processImage(key, imageParams, processImageCallback) {
    console.log("Processing image called with key=", key, ", imageParams=", imageParams);

    // Run all the steps in sync with response of 1 step acting as input for other.
    // avoiding the callback structure
    // https://caolan.github.io/async/docs.html#waterfall
    async.waterfall([
        function(callback) {
            // Get the file from the disk or S3
            console.log("Calling storage processor");
            storage.storage.getFile(imageParams.path, callback);
        },
        function(image, callback) {
            console.log("Check orientation");
            validateImageRotation(image, callback);
        },
        function(image, callback) {
            console.log("Validating Crop Size");
            validateImageCropSize(image, imageParams.size, callback);
        },
        function(image, cropSize, callback) {
            // Process the image as per the process type
            var cropFunction = getCropFunction(imageParams.processType);
            if (cropFunction) {
                console.log("Calling crop function for processType=", imageParams.processType);
                cropFunction(image, imageParams.size, callback);
            } else {
                console.log("Crop function not found for the processType=", imageParams.processType, ". Raising Error");
                callback({}); // call with err
            }
        },
        function(data, fileInfo, callback) {
            applyBlur(data, imageParams.blur, callback)
        },
        function(data, fileInfo, callback) {
            // save file to S3
            console.log("Saving file to storage");
            storage.storage.saveFile(key.replace('/',''), data, fileInfo, callback);
        },
    ], function(err, data) {
        // this function is always executed both in case of err and success as well
        console.log("Error raised while Processing raw File, Error=", err, ", data=", data);
        processImageCallback(err, data);
    });
}

function getCropFunction(cropType) {
    return functionMapping[cropType.toLowerCase()]
}

function validateImageRotation(image, callback) {
    sharp(image)
        .rotate()
        .toBuffer(function(err, data, info) {
            if (err) {
                callback(err);
            } else {
                callback(null, data);
            }
        })
}

function validateImageCropSize(image, size, callback) {
    sharp(image)
        .metadata()
        .then(function(metadata) {
            const asp_ratio = metadata.width/metadata.height;
            if (!size.height) {
                size.height = Math.round(size.width/asp_ratio);
            }
            if (!size.width) {
                size.width = Math.round(size.height * asp_ratio);
            }
            size.originalWidth = metadata.width;
            size.originalHeight = metadata.height;

            callback(null, image, size);
        }, callback);
}

function applyBlur(image, blur, callback) {
    if (blur) {
        sharp(image)
            .blur(blur)
            .toBuffer(callback)
    } else {
        sharp(image)
            .toBuffer(callback)
    }
}

function applySmartCrop(image, cropSize, callback) {
    smartcrop.crop(image, cropSize).then(function(result) {
        var crop = result.topCrop;
        sharp(image)
            .extract({ width: crop.width, height: crop.height, left: crop.x, top: crop.y })
            .resize(cropSize.width, cropSize.height)
            .toBuffer(callback)
    }, callback);
}

function applyCrop(image, cropSize, callback) {
    if (cropSize.widthPlus || cropSize.heightPlus || cropSize.width < cropSize.originalWidth || cropSize.height < cropSize.originalHeight) {
        applySmartCrop(image, cropSize, callback)
    } else {
        callback(null, image, {});
    }
}

function applyCoverResize(image, cropSize, callback) {
    if (cropSize.widthPlus || cropSize.heightPlus || cropSize.width < cropSize.originalWidth || cropSize.height < cropSize.originalHeight) {
        sharp(image)
            .resize(cropSize.width, cropSize.height)
            .max()
            .toBuffer(callback)
    } else {
        callback(null, image, {});
    }
}

function applyBlurredFrame(image, cropSize, callback) {
    let blurImg = sharp(image);
    let overlayImg = sharp(image);

    blurImg
        .metadata()
        .then(function(metadata) {
            var smartcrop;
            var resize;
            var resize_with_max;

            if (cropSize.widthPlus && cropSize.heightPlus) {
                //case where both the given width and height are required
                smartcrop = true;
            } else if (cropSize.widthPlus && !cropSize.heightPlus) {
                //case where the given width is required and height can be equal to or less than the given height
                //there would be blur effect on the right and the left side of the image is the width is smaller
                cropSize.height = Math.round(Math.min(cropSize.height, metadata.height * (cropSize.width / metadata.width), metadata.height));

                if (metadata.width >= cropSize.width) {
                    smartcrop = true;
                } else if (metadata.width < cropSize.width && metadata.height > cropSize.height) {
                    resize = true;
                }
            } else if (!cropSize.widthPlus && cropSize.heightPlus) {
                //case where the given height is required and width can be equal to or less than the given width
                //there would be blur effect on the top and the bottom of the image is the height is smaller
                cropSize.width = Math.round(Math.min(cropSize.width, metadata.width * (cropSize.height / metadata.height), metadata.width));

                if (metadata.height >= cropSize.height) {
                    smartcrop = true;
                } else if (metadata.height < cropSize.height && metadata.width > cropSize.width) {
                    resize = true;
                }
            } else {
                //case where there is no strict constraint on the width or height
                if (cropSize.width < cropSize.originalWidth || cropSize.height < cropSize.originalHeight) {
                    resize_with_max = true;
                } else {
                    callback(null, image, {});
                    return;
                }
            }

            if (smartcrop) {
                return applySmartCrop(image, cropSize, callback)
            } else if (resize) {
                overlayImg
                    .resize(cropSize.width, cropSize.height)
            } else if (resize_with_max) {
                overlayImg
                    .resize(cropSize.width, cropSize.height)
                    .max()
            }

            overlayImg
                .toBuffer(function(err, data, info) {
                    if (err) {
                        callback(err);
                    } else {
                        blurImg
                            .resize(cropSize.width, cropSize.height)
                            .blur(18)
                            .overlayWith(data)
                            .toBuffer(callback);
                    }
                });
            });
}

exports.processImage = processImage;
