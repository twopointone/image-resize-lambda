// This server is for development purposes. It wont be exported to lambda
var config = require('./config');
var express = require('express');
var app = express();
var lambda = require('./index.js');


// Match the lambda behaviour to generate the file and then serve from the destination bucket
app.use(express.static(config.DESTINATION_PATH));

app.get('/favicon.ico', function(req, res) {
    res.send('');
});

app.get('*', function(req, res) {
    var path = req.path;
    var handlerEvent = {
        queryStringParameters: {
            key: path
        }
    };

    function responseFunction(error, result) {
        if (!error) {
            res.writeHead(result.statusCode, result.headers);
            res.end();
        } else {

        }
    }

    lambda.handler(handlerEvent, {}, responseFunction);
});

app.listen(config.PORT);

