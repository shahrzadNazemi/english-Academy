var prettyBytes = require('pretty-bytes');
var moment = require('moment-jalaali');
var logger = require('morgan');


logger.token('res', function (req, res, field) {
    var sent = typeof res.headersSent !== 'boolean'
        ? Boolean(res._header)
        : res.headersSent;
    if (!sent) {
        return undefined
    }

    // get header
    var header = res.getHeader(field);
    if (field === 'content-length') {
        if (!isNaN(header))
            header = prettyBytes(parseInt(header));
    }

    return Array.isArray(header)
        ? header.join(', ')
        : header
});
logger.token('date', function (req, res, field) {
    return moment().format('jYYYY/jMM/jDD-HH:mm:ss.SSS');
});

function headersSent(res) {
    return typeof res.headersSent !== 'boolean'
        ? Boolean(res._header)
        : res.headersSent
}
function compile(format) {
    if (typeof format !== 'string') {
        throw new TypeError('argument format must be a string')
    }

    var fmt = format.replace(/"/g, '\\"')
    var js = '  "use strict"\n  return "' + fmt.replace(/:([-\w]{2,})(?:\[([^\]]+)\])?/g, function (_, name, arg) {
            var tokenArguments = 'req, res'
            var tokenFunction = 'tokens[' + String(JSON.stringify(name)) + ']'

            if (arg !== undefined) {
                tokenArguments += ', ' + String(JSON.stringify(arg))
            }

            return '" +\n    (' + tokenFunction + '(' + tokenArguments + ') || "-") + "'
        }) + '"'

    // eslint-disable-next-line no-new-func
    return new Function('tokens, req, res', js)
}


logger.format('dev', function developmentFormatLine(tokens, req, res) {
    // get the status code if response written
    var status = headersSent(res)
        ? res.statusCode
        : undefined

    // get status color
    var color = status >= 500 ? 31 // red
        : status >= 400 ? 33 // yellow
        : status >= 300 ? 36 // cyan
        : status >= 200 ? 32 // green
        : 0 // no color

    // get colored function
    var fn = developmentFormatLine[color]
    if (!fn) {
        // compile
        fn = developmentFormatLine[color] = compile(':date \x1b[0m:method :url \x1b[' +
            color + 'm:status \x1b[0m:response-time ms - :res[content-length]\x1b[0m')
    }

    return fn(tokens, req, res)
})

module.exports = logger('dev');