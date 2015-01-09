var fs = require('fs');
var util = require('util');

function readAPIs(app, path, config) {
    var delay = config.delay;
    var status = config.status;

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
                        if(api.delay) {
                            delay = api.delay;
                        }
                        if(delay) {
                            yield function (done) {
                                setTimeout(done, delay);
                            };
                        }

                        if(api.status) {
                            status = api.status;
                        }
                        if(status && status !== 200) {
                            this.status = status;
                            this.body = api.error || {message: '默认异常'};
                        } else {
                            this.body = api.response;
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