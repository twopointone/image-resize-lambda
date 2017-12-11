// This server is for development purposes. It wont be exported to lambda
var config = require('./config');
var express = require('express');
var app = express();
var lambda = require('./index.js');


// Match the lambda behaviour to generate the file and then serve from the destination bucket
app.use(express.static('bucket/output'));

app.get('*', function(req, res) {
    var path = req.path;
    var handlerEvent = {
        queryStringParameters: {
            key: path
        }
    };
    function responseFunction (data) {
        res.writeHead(data.statusCode, data.headers);
        res.end();
    }
    lambda.handler(handlerEvent, {}, responseFunction);
});

app.listen(config.PORT);

