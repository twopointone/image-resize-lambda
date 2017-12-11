require('dotenv').config();

var config = {};

config.PORT = process.env.PORT || 3000;

config.FILE_HANDLER = process.env.FILE_HANDLER;
config.BASE_DESTINATION_URL = process.env.BASE_DESTINATION_URL || 'http://localhost:' + config.PORT;

module.exports = config;