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
    var regex = /((size)\:(.*))/;
    var regexMatch = splitArray[0].match(regex);

    if (regexMatch && regexMatch.length > 0) {
        var size = getSizeData(splitArray[0]);

        splitArray.splice(0, 1);
        var path = splitArray.join('/');

        return {
            size: size,
            path: path
        }
    } else {
        return null
    }
}

function parsePageNumber(key) {
    var splitArray = key.split('/');
    var regex = /(page)\:(.*)/;
    var regexMatch = splitArray[0].match(regex);

    if (regexMatch && regexMatch.length > 0) {

        var pageNumber = parseInt(regexMatch[2], 10);

        splitArray.splice(0, 1);
        var path = splitArray.join('/');

        return {
            pageNumber: pageNumber,
            path: path
        }
    } else {
        return null
    }
}

function parseProcessType(key) {
    var splitArray = key.split('/');
    var regex = /(type)\:(.*)/;
    var regexMatch = splitArray[0].match(regex);

    if (regexMatch && regexMatch.length > 0) {
        var processType = regexMatch[2];

        splitArray.splice(0, 1);
        var path = splitArray.join('/');

        return {
            processType: processType,
            path: path
        }
    } else {
        return null
    }
}

function processAllParse(parseArray, key) {
    var params = {
        path: key
    };
    for(var i=0; i<parseArray.length;i++){
        var method = getParserFunction(parseArray[i]);
        var added_params = method(params.path);
        if (added_params != null) {
            params = Object.assign({},params, method(params.path));
        } else {
            return null
        }
    }
    return params
}

function getSizeData(string) {
    var regex = /(\d+)?x(\d+)?(\:extend:([w|h|b]))?/;
    var regexMatch = string.match(regex);
    if (regexMatch && regexMatch.length > 0) {
        const width = regexMatch[1] ? parseInt(regexMatch[1], 10): null;
        const height = regexMatch[2] ? parseInt(regexMatch[2], 10) : null;
        var heightPlus = null;
        var widthPlus = null;

        if (regexMatch[4]) {
            if (regexMatch[4] == 'h' || regexMatch[4] == 'b'){
                heightPlus = true;
            } else if (regexMatch[4] == 'w' || regexMatch[4] == 'b') {
                widthPlus = true;
            }
        }

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
