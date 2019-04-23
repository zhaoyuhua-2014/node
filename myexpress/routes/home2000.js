
/*   
   以爬取起点小说某文为例
*/
// 1. 首先引入模块

var express = require('express'),
  app = express(),
  request = require('request'),
  iconv = require('iconv-lite'),
  cheerio = require('cheerio'),
  async = require("async"), // 控制并发数，防止被封IP
  fs = require('fs'),
  JSONStream = require('JSONStream'),
  path = require('path');
  const PinYin = require('node-pinyin');


let bookdir = "../public/"
let total = 5234 // 总章节数
let startNum = 2000;
let endNum = 3000;
let id = 0 // 计数器
const chapter = 2 // 爬取多少章
// const url = 'https://book.qidian.com/info/1011146676#Catalog' // 章节列表页面
const url = 'https://www.booktxt.net/'
const encodedList = ['BG2312', 'utf-8'];

/**
 * 睡眠模拟函数
 * @param  {Number} numberMillis 毫秒
 */
function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
      now = new Date();
      if (now.getTime() > exitTime)
        return;
    }
}
const ajType = {
  'creatMk':'123'
};
let jsonData = {
  name:'',//书名
  targetUrl:'',//目标url
  author:'',//作者
  downloadUrl:'',//下载地址
  encode:'',//编码
  allChapterNumber: '', //总章节数目
  chapterList:[],//章节列表
};

/**
 * 爬取品牌 & 车系
 */
function fetchBrand(req, res) {
    var pageUrls = []; // 存放爬取网址
    let count = endNum; // 总数
    var countSuccess = 0; // 成功数
  
    for (let index = startNum; index < endNum; index++){
        pageUrls.push(url + '1_'+index);
    }
  
    var curCount = 0;
    var reptileMove = function (url, callback) {
      var startTime = Date.now(); // 记录该次爬取的开始时间
  
      request({
        url: url,
        encoding: null // 关键代码
      }, function (err, res, body) {
        if (err || res.statusCode != 200) {
          console.error(err);
          console.log('抓取该页面失败，重新抓取该页面..')
          reptileMove(url, callback);
          return false;
        }
        var html = iconv.decode(body, 'gb2312')
        var $ = cheerio.load(html);
        //var $ = cheerio.load(data.text); // 读取章节列表页面
        let urls = [];
        let bookName = $("#info h1").text();
        let bookAuthor = $("#info p").eq(0).text().split("：")[1];
        let downloadUrl = $("#info p").eq(3).find("a").attr('href');
        jsonData.name = bookName;
        jsonData.author = bookAuthor;
        jsonData.downloadUrl = downloadUrl;
        jsonData.targetUrl = url;
        jsonData.encode = 'BG2312';

        let total = $("#wrapper .box_con").eq(1); // 获取所以章节元素拿到总章节数
        let dds = total.find("dd");
        // 循环获取每个章节的页面url并push进urls
        dds.each(function (i, v) {
            if (i < dds.length) {
            let eIndex = $(v).find("a").attr('href').split(".")[0];
            if (urls.indexOf(eIndex) == -1) {
                urls.push(eIndex)
            }
            }
        })

        urls = urls.sort(function (a, b) {
            return a - b;
        });
        let newArr = urls.map((i) => {
            return url + i + ".html"
        })
        jsonData.allChapterNumber = newArr.length;
        //jsonData.chapterList = newArr;

        let fileName = PinYin(jsonData.name, {
            style: 'firstLetter'
        })
        let m = fileName.join("").toUpperCase();
        jsonData.fileName = m;
        let fileStr = bookdir +'json/' + m + '.json';
        countSuccess++;
        jsonData.index = countSuccess+startNum;
        fs.writeFileSync(fileStr, JSON.stringify(jsonData));
        
  
        
        var time = Date.now() - startTime;
        // console.log(Date.now())
        // sleep(1000)
        // console.log(Date.now())
        console.log(jsonData.index + ', ' + url + ', 耗时 ' + time + 'ms');
        callback(null, url + 'Call back content');
      });
    };
  
    // 使用async控制异步抓取   
    // mapLimit(arr, limit, iterator, [callback])
    // 异步回调
    async.mapLimit(pageUrls, 1, function (url, callback) {
      reptileMove(url, callback);
    }, function (err, result) {
      console.log('----------------------------');
      console.log(startNum+'--'+endNum+'条抓取完毕！');
      console.log('----------------------------');
    });
  
  }

  fetchBrand();


