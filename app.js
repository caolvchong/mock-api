var koa = require('koa');
var koaBody = require('koa-body');
var Router = require('koa-router');
var cors = require('koa-cors');
var readAPIs = require('./core');

var app = koa();
app.use(cors());
app.use(koaBody());
app.use(Router(app));

var argv = process.argv;
var params = {
    path: '',
    port: '',
    delay: '',
    status: ''
};
for(var i = 0, len = argv.length; i < len; i++) {
    var item = argv[i];
    for(var key in params) {
        if(item == '--' + key) {
            params[key] = argv[i + 1];
            i++;
            break;
        }
    }
}

readAPIs(app, params.path, {
    delay: +params.delay,
    status: +params.status
});

app.listen(+params.port);

module.exports = app;