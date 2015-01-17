var fs = require('fs');
var util = require('util');

var reg = {
    expression: /{{(.*?)}}/g,
    split: /\s*\|\s*/,
    json: /.+\.json$/
};

function parseResponse(res) {
    for (var key in res) {
        var val = res[key];
        if(typeof val === 'object') {
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

function readAPIs(app, path, config) {
    var delay = config.delay;
    var status = config.status;

    fs
        .readdirSync(path)
        .forEach(function (file) {
            var p = path + '/' + file;
            var stat = fs.statSync(p);
            if (stat.isFile() && file.match(reg.json) !== null) {
                var apis = require(p);
                if (!util.isArray(apis)) {
                    apis = [apis];
                }
                apis.forEach(function (api) {
                    app[api.method](api.url, function*() {
                        if (api.delay) {
                            delay = api.delay;
                        }
                        if (delay) {
                            yield function (done) {
                                setTimeout(done, delay);
                            };
                        }

                        if (api.status) {
                            status = api.status;
                        }
                        if (status && status !== 200) {
                            this.status = status;
                            this.body = api.error || {message: '默认异常'};
                        } else {
                            this.body = parseResponse.call(this, api.response || {});
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