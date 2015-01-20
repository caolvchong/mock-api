mock-api
=======================

[node.js]:  http://nodejs.org      "Node.js"
[nvm]:      https://github.com/creationix/nvm       "Node.js 包管理器"
[nodemon]:  https://github.com/remy/nodemon         "Node.js 程序运行监听热重启工具"
[mock-api]: https://github.com/caolvchong/mock-api  "前端使用JSON模拟API工具"
[koajs]:    http://koajs.com/#context               "Koa文档 - 请求上下文"

## 使用场景
在前端开发中，您可能遇到这样的情景：
>
项目讨论会后  
经理：好，开发时间就定为两周  
服务端：OK，没问题，两周能搞定  
前端：干，两周我也能搞定，可尼玛我要等服务端接口啊  
然后，这两周期间，你不断轮询服务端人员，催促接口。到最后，服务端如期完成，作为前端的你还在继续撸...


[mock-api][] 就是为了解决前端等待服务端开发接口而产生的一个小工具，使用json文件模拟服务端请求结果。工作流程编程了这样：
>
项目讨论会后  
经理：好，开发时间就定为两周  
服务端：OK，没问题，两周能搞定  
前端：OK，服务端先定义好接口文档，然后大家一起过一下文档  
经理：这是必须的  
然后服务端定义了接口文档，大家通过后，前端利用mock-api模拟和服务端并行开发  
两周后，项目开发如期完成

## 准备工作
使用[mock-api][]，需要具备：

1. [node.js][]环境，node版本需要 **v0.11.7+**，建议使用[nvm][]进行node的版本管理
2. 安装[mock-api][]，执行 `npm install -g mock-api` 即可

## 特点

1. json方式书写接口，简洁明了
2. 支持跨域访问，让本地无跨域烦恼
3. 热部署，修改json文件后自动重启服务，省去重复工作
4. 支持慢速网络模拟，方便前端测试
5. 错误自定义，便于处理各种协定好的异常

## 使用
假设服务端约好了一堆API，我们拿其中一个来示例：

```text
请求用户详情
GET: /users/:id
返回:
    {
        "id": 用户id,
        "name": "用户名",
        "level": 用户等级
    }
```

新建一个目录，比如取做：restful。在该目录下建立一个json文件（文件名不以_开头，以_开头的json文件可以作为数据源使用），比如：user.json，写入以下内容：

```json
[
    {
        "method": "get",
        "url": "/users/:id",
        "response": {
            "id": 1,
            "name": "tom",
            "level": 3
        }
    }
]
```

* **method**: 表示请求的类型，一般是 get、post、put、delete中的一种
* **url**: 请求的路由
* **response**: 返回的结果体

json支持`{{ }}` 表达式，例如：

```json
[
    {
        "method": "get",
        "url": "/users/:id",
        "response": {
            "id|number": "{{this.params.id}}",
            "name": "tom",
            "level": 3
        }
    }
]
```

其中，response结构的key支持指定输出number，而不是默认的string（因为`{{ }}`表达式必须包在双引号中）。
value中`{{ }}` 表达式常用支持的表达式有：

```javascript
// 路径参数
this.params[key]

// get参数
this.query[key]

// post参数
this.body[key]
```

这里的this其实就是Koa的请求上下文对象，具体使用可以参考[koajs][]文档。

如果需要模拟网络延迟或者请求失败，可以使用 **delay** 和 **status**、**error**，例如：

```json
[
    {
        "method": "get",
        "url": "/users/:id",
        "response": {
            "id": 1,
            "name": "tom",
            "level": 3
        },
        "delay": 3000,
        "status": 400,
        "error": {
            "message": "该用户不存在"
        }
    }
]
```

`0.1.0` 版本后支持js方式，提供更大的控制力：

```js
var store = [...];

module.exports = [{
    method: 'get',
    url: '/users',
    response: function(helper) {
        return helper.pagination(store, {
            limit: this.query.limit,
            offset: this.query.offset
        });
    }
}];
```

helper 是工具函数，目前提供:

* `pagination`，模拟分页情况，返回如下结构数据：

```json
{
    "data": [...],
    "pagination": {
        "limit": 
        "offset":
        "total":
    }
}
```

* `JSONCopy`，实现JSON深拷贝

另外，你可以使用nodejs能做到的所有功能。

然后执行：

```bash
mock-api serve /path/to/restful
```

上面的 `/path/to/restful` 是之前建立的restful目录的路径，可以是相对地址，也可以是绝对地址。

前端开发便可以通过 http://localhost:10086/users/1 访问到该接口。[mock-api][]已经做了跨域处理，因此不存在跨域问题。

如果需要定制端口，启动命令使用：

```bash
mock-api serve /path/to/restful -p port
```

注意，为了便于开发，建议将上面的 `http://localhost:10086` 进行配置，后期接入真实API则只需要修改一处配置即可。

如果需要统一模拟慢速网络，可以使用 **-d** 参数：

```bash
mock-api serve /path/to/restful -d 2000
```

如果需要统一模拟异常，可以使用 **-s** 参数：

```bash
mock-api serve /path/to/restful -s 400
```

如果需要提供静态文件服务（例如一些图片的访问），可以使用 **-S** 参数，默认是在 serve 的路径下的 static 目录：

```bash
mock-api serve /path/to/restful -S /path/to/static
```

命令行帮助可以通过以下命令查看：

```bash
mock-api serve -h
```


