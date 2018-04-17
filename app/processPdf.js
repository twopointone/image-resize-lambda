var async = require('async');
var request = require('request');
var config = require('../config.js');
var storage = require(config.STORAGE);
const path = require('path');
var gm = require('gm');


//params includes size, path, destPath, imageProcessType
function processPdf(destPath, pdfParams, processPdfCallback) {
    console.log("Processing pdf called with key=", pdfParams.path);

    // Run all the steps in sync with response of 1 step acting as input for other.
    // avoiding the callback structure
    // https://caolan.github.io/async/docs.html#waterfall
    async.waterfall([
        function(callback) {
            // Get the file from the disk or S3
            console.log("Calling storage processor");
            storage.storage.getFile(pdfParams.path, callback);
        },
        function(pdfContent, callback) {
            console.log("Creating PDF Preview");
            createPdfPreview(pdfContent, path.basename(destPath), pdfParams.page, callback);
        },
        function(imageData, callback) {
            // save file to S3
            storage.storage.saveFile(destPath, imageData, {format: ".png"}, callback);
        },
    ], function(err, data) {
        if(err) {
          console.log("Error raised while Processing pdf, Error=", err, ", data=", data);
        }
        processPdfCallback(err, data);
    });
}

function createPdfPreview(pdfContent, filename, page, callback){
  gm(pdfContent, filename+ "[0]").toBuffer("PNG", callback);
}

exports.processPdf = processPdf;
