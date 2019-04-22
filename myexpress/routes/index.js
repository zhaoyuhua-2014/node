var express = require('express');
var router = express.Router();


/*   
   以爬取起点小说某文为例
*/
// 1. 首先引入模块
const cheerio = require('cheerio')
const fs = require('fs');
const superagent = require('superagent')
const iconv = require('iconv-lite');
const Entities = require("html-entities");
const path = require('path')
require('superagent-charset')(superagent)
const async = require('async');


let bookdir = "public/book/"
let total = 0 // 总章节数
let id = 0 // 计数器
const chapter = 2 // 爬取多少章
// const url = 'https://book.qidian.com/info/1011146676#Catalog' // 章节列表页面
const url = 'https://www.booktxt.net/1_1562/'
const encodedList = ['BG2312', 'utf-8'];


const ajType = {
  'creatMk':
};

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("++++")
  console.log()
  let obj = req.query;
  if (obj.apiUrl) {
    superagent.get(url)
      .set({

        // ":authority": "www.booktxt.net",
        // :method: GET
        // :path: /1_1562/
        // :scheme: https
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh;q=0.9",
        // cache-control: max-age=0
        "cookie": "adClass0803=1; Hm_lvt_3a0ea2f51f8d9b11a51868e48314bf4d=1555848745; Hm_lpvt_3a0ea2f51f8d9b11a51868e48314bf4d=1555848745",
        // if-modified-since: Wed, 27 Mar 2019 19:17:04 GMT
        // if-none-match: W/"d81dc9a9d1e4d41:0"
        // upgrade-insecure-requests: 1
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36"

      })
      .charset('GB2312').end((err, res) => {
        //
        var $ = cheerio.load(res.text); // 读取章节列表页面
        let urls = [];

        let bookdir1 = bookdir + $("#info h1").text();

        fs.mkdirSync(bookdir1, err => {
          if (err) {
            console.log("创建目录err")
          } else {
            console.log("创建目录成功")
          }
        })
        let total = $("#wrapper .box_con").eq(1); // 获取所以章节元素拿到总章节数
        let allChilds = total.find("dt,dd");
        let dts = total.find("dt");
        let dds = total.find("dd");
        // 　　　　　// 循环获取每个章节的页面url并push进urls
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
        let newArr2 = newArr.splice(0, 2);
        // 　　　　　// 通过async去请求urls里的地址，并通过fetchUrl方法拆分数据。这里的async.mapLimit方法有点类似es6里的promise.all　
        // async.mapLimit(newArr2,chapter,(url,callback)=>{
        //     id++
        //     fetchUrl(url,callback,id);
        // },(err,results)=>{
        //     response.send(results);

        // })
        var obj = {
          box: 'box_con',

          // boxText:total.html(),
          // allChilds:allChilds.html(),
          // allChildsNumber:allChilds.length,
          // dts:dts.html(),
          // dtsNumber:dts.length,
          // dds:dds.html(),
          // ddsNumber:dds.length,
          arr: newArr2,
        }
        response.send(JSON.stringify(obj))
      })
  }else{

  }
  console.log("++++")
  res.render('index', { title: 'Express' });
});



// 去空格和空格转义字符
function trim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, '').replace(/&nbsp;/g, '')
}

// 将Unicode转汉字  
function reconvert(str) {
  str = str.replace(/(&#x)(\w{1,4});/gi, function ($0) {
    return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16));
  });
  return str
}

// 加载每个章节并拆分数据返回
function fetchUrl(url, callback, id) {
  console.log(url)
  superagent.get(url)
    .charset('GB2312')
    .end(function (err, res) {
      let $ = cheerio.load(res.text);
      let arr = []
      let content = reconvert($(".bookname h1").html())

      const obj = {
        id: id,
        err: 0,
        bookName: content,
        // title: $('.j_chapterName').text(),
        // content: content.toString()
      }
      callback(null, obj)
    })
}
module.exports = router;
