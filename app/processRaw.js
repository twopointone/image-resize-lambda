var config = require('../config.js');
var storage = require(config.STORAGE);

function getRaw(key, path, callback) {
    file = storage.storage.getFile(path, callback);
    callback(null, file, {});
}

exports.getRaw = getRaw;
