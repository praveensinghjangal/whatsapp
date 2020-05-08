var config = require('../../config');
var fs = require("fs"),
    util = require("util"),
    stack = require("callsite");

var log_file = config.logging.log_file;

function write_to_file(logstring) {
    fs.appendFile(log_file, logstring + '\n', function (error) {
        if (error) {
            process.stdout.write('error while log writing...');
        }
    });
}

module.exports = {
    log: function () {
        var trace = getTrace(stack()[1]);
        var string = util.format("%s [LOG] in %s:%d :: %s", trace.timestamp, trace.file, trace.lineno, util.format.apply(this, arguments));
        write_to_file(string);
        if (config.logging.console) {
            process.stdout.write(string + "\n");
        }

    },

    debug: function () {
        var trace = getTrace(stack()[1]);
        var string = util.format("%s [DEBUG] in %s:%d :: %s", trace.timestamp, trace.file, trace.lineno, util.format.apply(this, arguments));
        write_to_file(string);
        if (config.logging.console) {
            process.stdout.write(string + "\n");
        }
    },

    info: function () {
        var trace = getTrace(stack()[1]);
        var string = util.format("%s [INFO] in %s:%d :: %s", trace.timestamp, trace.file, trace.lineno, util.format.apply(this, arguments));
        write_to_file(string);
        if (config.logging.console) {
            process.stdout.write(colourise(36, string) + "\n");
        }
    },

    error: function () {
        var trace = getTrace(stack()[1]);
        var string = util.format("%s [ERROR] in %s:%d :: %s", trace.timestamp, trace.file, trace.lineno, util.format.apply(this, arguments));
        write_to_file(string);
        if (config.logging.console) {
            process.stdout.write(colourise(91, string) + "\n");
        }
    },

    warn: function () {
        var trace = getTrace(stack()[1]);
        var string = util.format("%s [WARNING] in %s:%d :: %s", trace.timestamp, trace.file, trace.lineno, util.format.apply(this, arguments));
        write_to_file(string);
        if (config.logging.console) {
            process.stdout.write(colourise(91, string) + "\n");
        }
    }
};

function getTrace(call) {
    return {
        file: call.getFileName(),
        lineno: call.getLineNumber(),
        timestamp: getFormattedDate()
    }
}

function getFormattedDate() {
    var dt = new Date();
    return dt.toDateString() + " " + dt.toLocaleTimeString();
}

function colourise(colourCode, string) {
    return "\033[" + colourCode + "m" + string + "\033[0m";
}