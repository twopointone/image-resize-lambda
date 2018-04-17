var async = require('async');
var request = require('request');
var config = require('../config.js');
var PDF2Pic = require('pdf2pic').default;
var storage = require(config.STORAGE);
const path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');


//params includes size, path, destPath, imageProcessType
function processPdf(destPath, remotePath, processPdfCallback) {
    console.log("Processing pdf called with key=", remotePath);

    // Run all the steps in sync with response of 1 step acting as input for other.
    // avoiding the callback structure
    // https://caolan.github.io/async/docs.html#waterfall
    async.waterfall([
        function(callback) {
            // Get the file from the disk or S3
            console.log("Calling storage processor");
            storage.storage.getFile(remotePath, callback);
        },
        function(pdfContent, callback) {
            console.log("Saving PDF File");
            savePdfFile(remotePath, pdfContent, callback);
        },
        function(pdfPath, callback) {
            console.log("Creating PDF Preview");
            createPdfPreview(pdfPath, callback);
        },
        function(imagePath, callback) {
            console.log("Reading Image File");
            readImageFile(imagePath, callback);
        },
        function(imageData, callback) {
            // save file to S3
            storage.storage.saveFile(destPath, imageData, {format: "image/png"}, callback);
        },
    ], function(err, data) {
        if(err) {
          console.log("Error raised while Processing pdf, Error=", err, ", data=", data);
        }
        processPdfCallback(err, data);
    });
}

function readImageFile(imagePath, callback){
  fs.readFile(imagePath, function (err, imageData) {
    fs.unlink(imagePath, function(){
      callback(null, imageData);
    });
  })
}

function savePdfFile(destPath, pdfBufferData, callback){
  var destFilePath = path.join(".tmp", destPath);
  mkdirp.sync(path.dirname(destFilePath));
  fs.writeFile(destFilePath, pdfBufferData);
  callback(null, destFilePath);
}

function createPdfPreview(pdfPath, callback){
  console.log(pdfPath);

  var converter = new PDF2Pic({
    // density: 100,           // output pixels per inch
    savename: path.basename(pdfPath),   // output file name
    savedir: path.dirname(pdfPath),    // output file location
    format: "png",          // output file format
    // size: 600               // output size in pixels
  });

  converter.convert(pdfPath).
  then(function(response){
    console.log("image converted successfully");
    fs.unlink(pdfPath, function(){
      callback(null, response.path);
    });
  });
}

exports.processPdf = processPdf;
