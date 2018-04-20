require('dotenv').config();

var config = {};

config.PORT = process.env.PORT || 3000;

// The storage should be specified w.r.t directory app
config.STORAGE = process.env.STORAGE || './storages/diskStorage';

config.DESTINATION_PATH = process.env.DESTINATION_PATH || 'bucket/output';
config.INPUT_IMAGE_SOURCE = process.env.INPUT_IMAGE_SOURCE || 'bucket/input';

// These values are required for the S3 storage.
config.INPUT_BUCKET = process.env.INPUT_BUCKET;
config.OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;
config.S3_MAX_AGE = process.env.S3_MAX_AGE || 86400;

config.BASE_DESTINATION_URL = process.env.BASE_DESTINATION_URL || 'http://localhost:' + config.PORT;
// process.env.PATH = process.env.PATH + ':/gm/usr/local/bin';

module.exports = config;
