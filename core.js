var koa = require('koa');
var koaBody = require('koa-body');
var Router = require('koa-router');
var fs = require('fs');
var util = require('util');
var cors = require('koa-cors');

function readAPIs(path, port) {
    var app = koa();
    app.use(cors());
    app.use(koaBody());
    app.use(Router(app));

    fs
        .readdirSync(path)
        .forEach(function (file) {
            var p = path + '/' + file;
            var stat = fs.statSync(p);
            if (stat.isFile() && file.match(/.+\.json$/g) !== null) {
                var apis = require(p);
                if (!util.isArray(apis)) {
                    apis = [apis];
                }
                apis.forEach(function (api) {
                    app[api.method](api.url, function*() {
                        this.body = api.response;
                    });
                });
            } else if (stat.isDirectory()) {
                readAPIs(p)
            }
        });

    app.listen(port);
}

module.exports = readAPIs;