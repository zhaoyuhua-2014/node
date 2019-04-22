var express = require('express');
var http = require('http');
var cheerio = require('cheerio');

var app = express();


// 静态文件
app.use( express.static('static'));

app.post("/reptile",function(req , res){
    console.log(req.url);
    res.send("查询结束")
})
app.get("/reptile",function(req , res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8")

    let getUrl = req.query.apiUrl;


    res.send(JSON.stringify({msg:"查询结束",url:getUrl}))
})
app.get('/', function (req, res) {
    console.log("qingqiujinru ")
    //res.sendFile( __dirname + "/" + "index.htm" );
})
var server = app.listen(8080, function () {

    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})