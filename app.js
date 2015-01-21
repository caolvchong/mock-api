var koa = require('koa');
var koaBody = require('koa-body');
var Router = require('koa-router');
var cors = require('koa-cors');
var serve = require('koa-static');
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
    status: '',
    staticPath: ''
};
for(var i = 2, len = argv.length; i < len; i++) {
    var arr = argv[i].split(' ');
    for(var key in params) {
        if(arr[0] == '--' + key) {
            params[key] = arr[1];
            break;
        }
    }
}

// 静态文件中间件
app.use(serve(params.staticPath));

readAPIs(app, params.path, {
    delay: +params.delay,
    status: +params.status
});

app.listen(+params.port);

module.exports = app;
