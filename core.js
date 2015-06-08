var fs = require('fs');
var util = require('util');
var helper = require('./helper');

var reg = {
    expression: /{{(.*?)}}/g,
    split: /\s*\|\s*/,
    json: /^[^_].*\.json$/,
    js: /.+\.js$/
};

function parseResponse(res) {
    for (var key in res) {
        var val = res[key];
        if (typeof val === 'object') {
            parseResponse.call(this, val);
        }
        if (typeof val === 'string' && val.match(reg.expression)) {
            var arr = key.split(reg.split);
            if (arr[1]) {
                res[arr[0]] = res[key];
                delete res[key];
                key = arr[0];
            }
            res[key] = val.replace(reg.expression, function (match, expression) {
                return eval(expression);
            }.bind(this));
            if (arr[1] === 'number') {
                res[key] = +res[key];
            }
        }
    }
    return res;
}

function getResult(val, scope) {
    var result;
    if (typeof val === 'function') {
        result = val.call(scope, helper);
    } else {
        result = JSON.parse(JSON.stringify(val));
    }
    return result;
}

function readAPIs(app, path, config) {
    var delay = config.delay;
    var status = config.status;

    fs
        .readdirSync(path)
        .forEach(function (file) {
            var p = path + '/' + file;
            var stat = fs.statSync(p);
            var isJson = file.match(reg.json) !== null;
            var isJs = file.match(reg.js) !== null;
            if (stat.isFile() && (isJs || isJson)) {
                var apis = require(p);
                if (!util.isArray(apis)) {
                    apis = [apis];
                }
                apis.forEach(function (api) {
                    app[api.method](api.url, function*() {
                        if (api.delay) {
                            delay = getResult(api.delay, this);
                        }
                        if (delay) {
                            yield function (done) {
                                setTimeout(done, delay);
                            };
                        }

                        if (api.status) {
                            status = getResult(api.status, this);
                        }
                        if (status && status !== 200) {
                            this.status = status;
                            this.body = getResult(api.error, this) || {message: '默认异常'};
                        } else {
                            this.body = parseResponse.call(this, getResult(api.response, this) || {});
                        }
                    });
                });
            } else if (stat.isDirectory()) {
                readAPIs(app, p, config)
            }
        });
    return app;
}

module.exports = readAPIs;