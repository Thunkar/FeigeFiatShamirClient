var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./config.cnf', 'utf8').toString());
exports.config = config;

var readLine = require('readline'),
    net = require('net'),
    winston = require('winston'),
    logger = require('./utils/logger.js'),
    obj = require('./utils/obj.js'),
    math = require('./utils/math.js'),
    systemLogger = winston.loggers.get('system');

var status = {};
var client = new net.Socket();

client.connect(config.port, config.host, function () {
    systemLogger.info("Connected to server");
});

var processInput = function (data) {
    var commands = data.toString().split(" ");
    switch (commands[0]) {
        case "SETUP": return "SETUP " + JSON.stringify({ k: parseInt(commands[1]) });
        case "X": return "X";
        case "FX": return "FX";
        case "A": return "A " + JSON.stringify(math.generateA(status.k));
        case "Y": return "Y";
        case "FY": return "FY";
        case "CHECK": return { result: math.check(status.y, status.x, status.v, status.a, status.n) }
        case "STATUS": return status;
        case "RESET": {
            status = {};
            return "RESET";
        }
    }
}

var stdin = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

stdin.on('line', function (d) {
    var processed = processInput(d);
    if (typeof processed === 'object') {
        systemLogger.info(processed);
    }
    else {
        systemLogger.debug(processed);
        client.write(processed);
    }
});

client.on('data', function (d) {
    systemLogger.info("Server: ACK");
    try {
        var data = JSON.parse(d);
        obj.merge(status, data);
        systemLogger.debug(data);
    } catch (err) { }
});

client.on('error', function (err) {
    systemLogger.error(err.message);
    client.destroy();
    stdin.close();
    process.exit();
});

process.on('SIGINT', function () {
    systemLogger.info("Shutting down...");
    client.destroy();
    stdin.close();
    process.exit();
});