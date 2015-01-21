#!/usr/bin/env node --harmony

var pathUtil = require('path');
var program = require('commander');
var nodemon = require('nodemon');
var pck = require('./package.json');

var defaults = {
    port: 10086,
    delay: 0,
    status: 200,
    staticPath: './static'
};

program
    .version(pck.version)
    .command('serve [path]')
    .description('本地API模拟器')
    .option('-p, --port <port>', '服务器端口，默认' + defaults.port) // 服务端口
    .option('-d, --delay <delay>', '模拟网络延迟，默认不延迟') // 延迟返回，模仿网络延迟
    .option('-s, --status <status>', '返回的HTTP状态码，默认' + defaults.status) // 状态码
    .option('-S, --staticPath <staticPath>', '静态文件服务目录，默认' + defaults.staticPath) // 静态文件服务目录
    .action(function (path, options) {
        path = pathUtil.resolve(process.cwd(), path || '.');
        var staticPath = pathUtil.resolve(process.cwd(), options.staticPath || pathUtil.resolve(path, defaults.staticPath));
        var port = +options.port || defaults.port;
        var delay = +options.delay || defaults.delay;
        var status = +options.status || defaults.status;
        var params = {
            path: path,
            port: port,
            delay: delay,
            status: status,
            staticPath: staticPath
        };
        var arr = [];
        for (var key in params) {
            arr.push('--' + key + ' ' + params[key]);
        }
        var appFile = pathUtil.resolve(__dirname, 'app.js')
        nodemon({
            script: appFile,
            args: arr,
            nodeArgs: ['--harmony'],
            watch: path,
            ext: 'json,js'
        }).on('restart', function (files) {
            files.forEach(function (file) {
                var date = new Date();
                console.log('%s:%s:%s.%s - reload %s', date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds(), file);
            });
        });
    })
    .on('--help', function () {
        console.log('  Examples:');
        console.log('');
        console.log('    $ mock-api serve path/to/folder');
        console.log('    $ mock-api serve path/to/folder -p 8000');
        console.log('    $ mock-api serve path/to/folder -p 8000 -d 2000');
        console.log('    $ mock-api serve path/to/folder -s 400');
        console.log('    $ mock-api serve path/to/folder -S path/to/static');
        console.log('');
    });

program.parse(process.argv);
