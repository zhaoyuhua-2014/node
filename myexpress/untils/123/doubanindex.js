var http = require('http');
var https = require('https');
var fs = require('fs');
var cheerio = require("cheerio");
var request = require('request');
var i=0;
var url="https://book.douban.com/tag/?view=type&icn=index-sorttags-all";
//连接数据库将数据存储到数据库中
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');
// Connection URL
var mongodburl = 'mongodb://localhost:27017/';


//封装数据库操作
var MongoDb = {
	Client : function (){
		
	}
}

var TIMEKG = true;
//封装http请求网页
function httpHtml(x,callback){
	
	//采用http模块向服务器发送一起get请求
	http.get(x,function(res){
		var html = ''//用来存储整个页面的数据
		res.setEncoding("utf-8");//防止中文乱码
		//监听data事件，每次取一块数据
		res.on("data",function(chunk){
			html +=chunk;
		})
		//监听end事件，如果网页内的HTML都获取完毕，就执行回调函数
		res.on("end",function(){
			//采用cheerio解析HTML
			var $ = cheerio.load(html);
			callback()
		})
	})
}
//封装https请求网页
function httpsHtml(x,callback){
	var x = encodeURI(x);
	//采用http模块向服务器发送一起get请求
	https.get(x,function(res){
		var html = ''//用来存储整个页面的数据
		res.setEncoding("utf-8");//防止中文乱码
		//监听data事件，每次取一块数据
		res.on("data",function(chunk){
			html +=chunk;
		})
		//监听end事件，如果网页内的HTML都获取完毕，就执行回调函数
		res.on("end",function(){
			//采用cheerio解析HTML
			var $ = cheerio.load(html);
			callback(html,x)
			html = "";
		})
	})
}

function startRequest(x){
	//采用http模块向服务器发送一起get请求
	https.get(x,function(res){
		var html = ''//用来存储整个页面的数据
		res.setEncoding("utf-8");//防止中文乱码
		//监听data事件，每次取一块数据
		res.on("data",function(chunk){
			html +=chunk;
		})
		//监听end事件，如果网页内的HTML都获取完毕，就执行回调函数
		res.on("end",function(){
			//采用cheerio解析HTML
			var $ = cheerio.load(html);
			
		})
	})
}

function saveIndex(path,data){
	if (path.indexOf("https://")) {
		
	}
	var path = "data/rawData/html/book.douban.com.html";
	console.log(path)
	fs.writeFile(path,data,function(err){
		if(err) throw err;
	})
}



/*
定义每个图书的类
 * */
var objClass = {
	log:"",//书图片地址
	name:"",//书名
	OriginalName:"",//原作名
	author:"",//作者
	Translator:"",//译者
	comment:"",//评分
	commentNum:"",//评论人数
	tag:[],//常用标签
	url:""//本地存储的书的内容的地址
};

var TagAll = {};
//保存所有标签为json文件
function getTagAll (html,x){
	//采用cheerio解析HTML
	var $ = cheerio.load(html);
	
	var box = $(".article").children().not(".tag-view-type").children();
	
	for (var i =0 ;i <box.length ; i++) {
		var item = box.eq(i);
			Key = item.find(".tag-title-wrapper").attr("name");
		
		if (TagAll[Key]) {
			
		}else{
			TagAll[Key] = Subclass(i,item.find(".tagCol"));
		}
		
	};
	fs.writeFile("type.json",JSON.stringify(TagAll),function(err){
		if(err) throw err;
		console.log("读取保存类型成功")
		redJson()
	})
	
	//给据box内容返回拼接的对象
	function Subclass(i,box) {
		var arr = [];
		//二级类型
		var obj1 = {
			id:null,//唯一id
			name:null,//分类的标签名字
			href:null,//链接
		}
		var items = box.find("td");
		for (var m = 0; m < items.length;m++) {
			var item = items.eq(m);
			obj1.id = i.toString() + "-" + m.toString();
			
			obj1.name = unescape(item.find("a").html().replace(/&#x/g, '%u').replace(/;/g, ''));
			obj1.href = item.find("a").attr("href");
			obj1.num = item.find("b").html().replace(/\(|\)/g,"");
			arr.push(obj1);
			obj1 = {
				id:null,//唯一id
				name:null,//分类的标签名字
				href:null,//链接
			}
		}
		return arr;
	}
}

httpsHtml(url,getTagAll)
/*httpsHtml("https://book.douban.com/tag/小说",test)
function test(html,x){
	console.log(x);
	//采用cheerio解析HTML
	var $ = cheerio.load(html);
	console.log($("title").html())
}*/

//读取本地的json文件创建类型分页链接
function redJson(){
	var AllData = null;
	getData();
	//获取数据
	function getData(){
		try{
			fs.readFile('type.json',"utf-8",function(err,data){
				if (err) throw err;
				AllData = JSON.parse(data);
				HandleData(AllData)
			})
		}catch(e){
			console.log("读取文件出现异常")
		}
	}
	
	function HandleData(d){
		
		var path = "data/rawData/html/"
		var urlArrs = [];
		for (var i in d) {
			function a(i){
				if (fsExistsSync(path + i)) {
					console.log("文件存在");
				}else{
					console.log('文件不存在或不是标准文件');
			        fs.mkdir(path+i,function(err){
						if (err) {
							throw err;
						}
						console.log("创建"+i+"文件夹成功")
					})
				}
			}
			a(i)
			for (var j in d[i]) {
				urlArrs.push(https + d[i][j].href)
				if (i == "文学" && j == 0) {
					TypeListHtml(d[i][j].href,i);
				}
			}
		}
	}
}

//redJson()


//对整理后的url数据进行爬取
function TypeListHtml(url,pa){
	var https_ = "https://book.douban.com";
	var path_ = "data/rawData/html/"+pa+"/"
	var a = https_ + url;
	
	
	httpsHtml(a,listHtml)
	function listHtml(html,x){
		var x = decodeURI(x);
		//采用cheerio解析HTML
		var $ = cheerio.load(html);
		
		//判断有没有下一页继续调用
		var box = $("#subject_list");
		var li = box.find(".subject-list li");
		var page = box.find(".paginator")
		
		if (page) {
			var l = page.find(".next a").attr("href");
			httpsHtml(https_ + l,listHtml)
		}
		
		//创建文件夹以及文件存储
		if (x.indexOf("?") == -1) {
			var res = x.split("/")[x.split("/").length - 1];
			var path_1 = path_ + res;
			if (fsExistsSync(path_1)) {
				savelistHtml(path_1+"/00.html",html)
			}else{
				fs.mkdir(path_ + res,function(err){
					if (err) {
						throw err;
					}
					console.log("创建"+res+"文件夹成功")
				})
			}
		}else{
			var m = x.split("?")[0];
			var n = x.split("?")[1];
			var res = m.split("/")[m.split("/").length - 1];
			var res1 = n.split("&")[0].split("=")[1];
			
			var path_1 = path_ + res + "/" + res1 + ".html";
			savelistHtml(path_1,html)
		}
		
	}
	//存储list页面
	function savelistHtml(path,html){
		fs.writeFile(path,html,function(err,data){
			if(err) throw err;
			console.log("存储原始文件"+path+"成功")
		})
	}
}

//检测文件或者文件夹存在 nodeJS
function fsExistsSync(path) {
    try{
        fs.accessSync(path,fs.F_OK);
    }catch(e){
        return false;
    }
    return true;
}








