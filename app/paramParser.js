const functionMapping = {
    'processor': parseProcessor,
    'size': parseSize,
    'pageNumber': parsePageNumber,
    'processType': parseProcessType
};

function getParserFunction(parser) {
    return functionMapping[parser]
}

function parseProcessor(key) {
    var splitArray = key.split('/');
    splitArray.splice(0, 1);

    var regex = /(images|pdf|raw)/;
    var regexMatch = splitArray[0].match(regex);

    if (regexMatch && regexMatch.length > 0) {
        splitArray.splice(0, 1);
        var path = splitArray.join('/');

        return {
            processor: regexMatch[0],
            path: path
        }
    } else {
        return null
    }
}

function parseSize(key) {
    var splitArray = key.split('/');
    var regex = /(([a-zA-Z]+)\:(.*))/;
    var regexMatch = splitArray[0].match(regex);
    var size = getSizeData(splitArray[0]);

    splitArray.splice(0, 1);
    var path = splitArray.join('/');

    return {
        size: size,
        path: path
    }
}

function parsePageNumber(key) {
    var splitArray = key.split('/');
    var regex = /([a-zA-Z]+)\:(.*)/;
    var regexMatch = splitArray[0].match(regex);
    var pageNumber = parseInt(regexMatch[2], 10);

    splitArray.splice(0, 1);
    var path = splitArray.join('/');

    return {
        pageNumber: pageNumber,
        path: path
    }
}

function parseProcessType(key) {
    var splitArray = key.split('/');
    var regex = /([a-zA-Z]+)\:(.*)/;
    var regexMatch = splitArray[0].match(regex);
    var processType = regexMatch[2];

    splitArray.splice(0, 1);
    var path = splitArray.join('/');

    return {
        processType: processType,
        path: path
    }
}

function processAllParse(parseArray, key) {
    var params = {
        path: key
    };
    parseArray.forEach(function(parser) {
        var method = getParserFunction(parser);
        params = Object.assign({},params, method(params.path));
    });
    return params
}

function getSizeData(string) {
    var regex = /(\+?)(\d+)?x(\+?)(\d+)?/;
    var regexMatch = string.match(regex);
    if (regexMatch && regexMatch.length > 0) {
        const widthPlus = regexMatch[1] ? true : false;
        const width = regexMatch[2] ? parseInt(regexMatch[2], 10): null;
        const heightPlus = regexMatch[3] ? true : false;
        const height = regexMatch[4] ? parseInt(regexMatch[4], 10) : null;

        return {
            width: width,
            height: height,
            widthPlus: widthPlus,
            heightPlus: heightPlus
        }
    }
    return null
}

exports.processAllParse = processAllParse;
