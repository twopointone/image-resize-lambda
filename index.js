var applySmartCrop = require('./app/image-resize')

exports.handler = function(event, context) {
    var src = 'https://raw.githubusercontent.com/jwagner/smartcrop-gm/master/test/flower.jpg';
    applySmartCrop.applySmartCrop(src, 'flower-square.jpg', 128, 128);
};