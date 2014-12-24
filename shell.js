#!/usr/bin/env nodemon --harmony -e json

var pathUtil = require('path');
var program = require('commander');
var pck = require('package.json');
var readAPIs = require('./core');

program
    .version(pck.version)
    .command('serve [path]')
    .description('serve the path which includes json files')
    .option('-p, --port <port>', 'port', 3001)
    .action(function (path, options) {
        path = pathUtil.resolve(__dirname, path || '.');
        var port = options.port;
        readAPIs(path, port);

    });

program.parse(process.argv);
