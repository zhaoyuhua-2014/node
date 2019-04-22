/**
 * Created by Administrator on 
 */
/*exports.index = function(res){
    res.writeHead(200,{
        'Content-type':"text/html"});
    res.write('<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'
        +'床前明月光');
    res.end();
};*/
/*var isChinese = require("is-chinese");
var a = isChinese("中").should.true();
console.log(a);*/
var isChinese = require('is-chinese')
console.log(isChinese('中国'))
console.log(isChinese('中国ss'))
console.log(isChinese('ss'))
console.log(isChinese('\uD842\uDFB7'))
var m = "http:www.baidu.com/中国";
console.log(m)
console.log(encodeURI(m))

