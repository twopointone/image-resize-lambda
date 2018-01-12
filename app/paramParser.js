const minBlurRadius = 0.3;
const maxBlurRadius = 1000;

const functionMapping = {
    'processor': parseProcessor,
    'size': parseSize,
    'extend': parseExtend,
    'blur': parseBlur,
    'pageNumber': parsePageNumber,
    'processType': parseProcessType,
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

function parseBlur(key){
    var splitArray = key.split('/');
    var regex = /blur:(([0-9]*[.])?[0-9]+)/;
    var regexMatch = splitArray[0].match(regex);
    var blur = null;

    if (regexMatch && regexMatch.length > 0) {
        splitArray.splice(0, 1);

        var blur = parseFloat(regexMatch[1])
        blur = (blur < minBlurRadius) ? minBlurRadius : blur ;
        blur = (blur > maxBlurRadius) ? maxBlurRadius : blur ;
    }

    var path = splitArray.join('/');

    return {
        blur: blur,
        path: path
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

function parseExtend(key) {
    var splitArray = key.split('/');
    var regex = /extend:([w|h|b])/;
    var regexMatch = splitArray[0].match(regex);

    var heightPlus = null;
    var widthPlus = null;

    if (regexMatch && regexMatch.length > 0) {
        splitArray.splice(0, 1);

        heightPlus = regexMatch[1] === 'h' || regexMatch[1] === 'b';
        widthPlus = regexMatch[1] === 'w' || regexMatch[1] === 'b';
    }

    var path = splitArray.join('/');

    return {
        extend: {heightPlus: heightPlus, widthPlus: widthPlus},
        path: path
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
    //merging extend params into the size
    if (params.hasOwnProperty("size") && params.hasOwnProperty("extend")) {
        params.size = Object.assign({}, params.size, params.extend);
    }

    return params
}

function getSizeData(string) {
    var regex = /(\d+)?x(\d+)?/;
    var regexMatch = string.match(regex);
    if (regexMatch && regexMatch.length > 0) {
        const width = regexMatch[1] ? parseInt(regexMatch[1], 10): null;
        const height = regexMatch[2] ? parseInt(regexMatch[2], 10) : null;

        return {
            width: width,
            height: height
        }
    }
    return null
}

exports.processAllParse = processAllParse;
