/*
 http模块
 创建一个服务在node上运行服务后在本地打开浏览器就可以访问了
 createServer 创建一个node服务
 request 这个对象通常由HTTP SERVER 建立而非用户手动建立， 
			并且会作为传递给'request'事件监听器第一个参数(就是http.Server相关的request事件当中的函数的参数，一个是request，一个是response)
 response 这个对象一般由HTTP 服务器(也就是http.Server)建立而非用户自己手动建立。它作为'request'事件的第二个参数，这是一个可写流。
 
1.request.method
	request.method 是一个只读的字符串。例如：“get",""Delete"
2.request.url
	表示所请求的URL字符串，他仅包括实际的http请求中的URL地址。如果这个请求是
	GET /status?name=ryan HTTP/1.1\r\n
	Accept: text/plain\r\n
	\r\n
则request.url应当是
'/status?name=ryan'
※ 如果你想要解析这个URL 中的各个部分

	如果你想要解析这个URL 中的各个部分， 
	你应当使用require('url').parse(request.url). Example:
	node> require('url').parse('/status?name=ryan')
	{ href: '/status?name=ryan'
	, search: '?name=ryan'
	, query: 'name=ryan'
	, pathname: '/status'
	}
※ 如果你想从查询字符串中提出这些参数

	如果你想从查询字符串中提出这些参数， 
	你可以使用require(‘querystring’).parse 方法,或者传一个true 作为第二个 参数给require(‘url’).parse 方法。 Example:
	
	node> require('url').parse('/status?name=ryan', true)
	{ href: '/status?name=ryan'
	, search: '?name=ryan'
	, query: { name: 'ryan' }
	, pathname: '/status'
	}
3.request.headers只读
4.request.httpVersion 这是http协议版本（字符串形式），只读。
	例如'1.1','1.0' 。 
	request.httpVersionMajor 是第一个数字， 
	request.httpVersionMinor 是第二个数字。
5.request.setEncoding(encoding='null')
	设置次请求的包体的字符编码‘utf-8或者'binary'
	缺省值是null，这表示'data'事件的参数将会是一个Buffer对象
6.request.pause()
	暂停次request触发事件，对于控制上传十分有用
7.request.resume()
	恢复一个暂停的request
8.request.connection
	request.connection 是一个代表当前链接的net.Stream对象
	对于HTTPS，使用request.connection.verifyPeer()和request.connection.getPeerCertificate()来获取看客户端（浏览器）的认证详情
	
	
	
1. response.writeHead(statusCode, [reasonPhrase], [headers])

	这个方法的是用来发送一个响应报文头给本次的请求方， 
	第一个参数状态码是由一个3位数字所构成的HTTP 状 态，比如404之类的。 
	最后一个参数headers 是响应头具体内容. 
	也可以使用一个方便人们直观了解的reasonPhrase 作为第二个参数。 
例如：
	var body = 'hello world';
	response.writeHead(200, {
		'Content-Length': body.length,
		'Content-Type': 'text/plain'
	});
	在一次完整信息交互中此方法只能调用一次， 
	并且必须在调用response.end()之前调用。
2. response.write(chunk, encoding=’utf8’)

	此方法必须在writeHead 方法调用后才可以被调用，它负责发送响应报文中的部分数据。 
	如果要发送一个报文体的多个部分，则可以多次调用此方法。
	
	参数chunk 可以是一个字符串或者一个buffer。 
	如果chunk 是一个字符串，则第二个参数指定如何将这个字符串 编码成字节流， 
	缺省情况下，编码为’utf8’。
	
	注意: 
	这是一个原始格式http 报文体， 
	和高层协议中的多段消息体编码格式({'Transfer-Encoding':'chunked'})无关。
	
	第一次调用response.write()时， 
	此方法会将已经缓冲的消息头和第一块消息体发送给客户。
	
	当第二次调用 response.write()的时候， 
	node 将假定你想要以流的形式发送数据（分别发送每一个数据块并不做缓存）。 
	这样， 其实response 对象只是缓存消息体的第一个数据块。

3. response.end([data], [encoding])

	这个方法会告诉服务器此响应的所有报文头及报文体已经发出； 
	服务器在此调用后认为这条信息已经发送完毕； 
	这个方法必须对每个响应调用一次。
	
	如果指定data 参数， 
	他就相当于调用了response.write(data, encoding)然后跟着调用了response.end()。
 * */

var http = require("http");
var fs = require("fs");


//主页路由模块,file文件夹里的index.js文件
var index = require('./index');
//错误处理文件路径
var error = "404.html";
//mongodb页面路径
var cx = "html/testmongodb.html";


//函数Response，将HTML、css、js等文件响应给客户端
var Response = function(res,filePath){
    //读取文件，读取完成后给客户端响应
    fs.readFile(filePath,function(err,data){
        if(err){                        //如果失败，就返回错误文件
            if(filePath != error)       //如果失败的不是错误文件，才返回错误文件
                Response(res,error);
        }else{
            res.writeHead(200,{              //响应客户端，将文件内容发回去
                'Content-type':"text/html"});
            res.end(data);
        }
    });
};
//404错误响应文件
var error404 = function(res){
   Response(res,error);
};



//创建一个服务
var server = http.createServer(function(req,res){
	/*console.log(request.method)
	console.log(request.headers);
	console.log("request going");
	
	
	fs.readFile("index.html",function(err,data){
		if (err) {
			throw err;
		}
		response.end(data);
	})*/
	console.log(req.url);               //在控制台打印请求
    //判断URL，提供不同的路由
    if(req.url == '/index' || req.url == '/') {    //主页
    	Response(res,"index.html");
    }else if(req.url == '/html/testmongodb.html') {   //访问cunxiao.html（特意使用中文命名)
    	Response(res,cx);
    }else {                              //访问其它静态文件，如/stylesheets/index.css
        Response(res,"./file"+req.url);
    }
});
//启动监听服务
server.listen("3000",function(){
	console.log("NodeJs server Success");
})
//创建一个接口服务器
http.createServer(function(req,res){
	
}).listen(4000)
