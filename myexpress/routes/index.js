var express = require('express');
var router = express.Router();
const PinYin = require('node-pinyin');
const ajaxPromises = require('ajax-promises');
const co = require("co");

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

let DbServer = require("../mongodb/mongdb_test");
    dbServer = new DbServer();

express.static('myexpress' )
let {
  readFile,
  readdir,
  writeFile
} = require('../untils/fsPromise.js'); //引入要使用的方法

let bookdir = "public/book/"
let total = 0 // 总章节数
let id = 0 // 计数器
const chapter = 2 // 爬取多少章
// const url = 'https://book.qidian.com/info/1011146676#Catalog' // 章节列表页面
const url = ''
const encodedList = ['BG2312', 'utf-8'];


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
/* GET home page. */
router.get('/', function(req, res, next) {
  let obj = req.query;
  if (obj.apiUrl) {
    console.log("爬取地址："+obj.apiUrl)
    res.header("Content-Type", "application/json; charset=utf-8");
    try {
      co(function* () {

        dbServer.find({
          'targetUrl': obj.apiUrl
        }).then( d => {

          if (d && d.length ) {
            res.end(JSON.stringify({
              msg:'自己的数据库中有，不用重复获取'
            }))
          }else{
            console.log("自己的数据库没有，马上发出获取的请求")
            getUrl(obj.apiUrl , res)
          }
        })
      })
    } catch (error) {
      res.end('200','error')
    }
  }else if(obj.type == 'db'){
    commitMongodb();
    res.end("200",'sucess')
  }else{
    res.render('index', {
      title: 'Express'
    })
  }
  
});

function getUrl(url, res) {
  console.log('123')
  superagent.get(url)
    .charset('GB2312')
    .end((err, data) => {
      if (err) {
        res.send(JSON.stringify({
          "err": "error"
        }))
      }
      var $ = cheerio.load(data.text); // 读取章节列表页面
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
      let fileStr = './public/json/' + m + '.json';
      console.log(jsonData)
      dbServer.insert(jsonData).then( d => {
        console.log("insert befor")
      });
      console.log('456')
      //fs.writeFileSync(fileStr, JSON.stringify(jsonData));
      res.end(JSON.stringify({text:"请求成功"}))
    })
}


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




// if (obj.apiUrl) {
//   superagent.get(url)
//     // .set({
//     //   // ":authority": "www.booktxt.net",
//     //   // :method: GET
//     //   // :path: /1_1562/
//     //   // :scheme: https
//     //   // cache-control: max-age=0
//     //   // if-modified-since: Wed, 27 Mar 2019 19:17:04 GMT
//     //   // if-none-match: W/"d81dc9a9d1e4d41:0"
//     //   // upgrade-insecure-requests: 1

//     //   "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
//     //   "accept-encoding": "gzip, deflate, br",
//     //   "accept-language": "zh-CN,zh;q=0.9",
//     //   "cookie": "adClass0803=1; Hm_lvt_3a0ea2f51f8d9b11a51868e48314bf4d=1555848745; Hm_lpvt_3a0ea2f51f8d9b11a51868e48314bf4d=1555848745",
//     //   "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36"
//     // })
//     .charset('GB2312').end((err, res) => {
//       //
//       var $ = cheerio.load(res.text); // 读取章节列表页面
//       let urls = [];

//       let bookName = $("#info h1").text();
//       let bookAuter = $("#info p").eq(0).text().split("：")[1];
//       let downloadUrl = $("#info p").eq(3).find("a").attr('href');
//       jsonData.name = bookName;
//       jsonData.bookAuter = bookAuter;
//       jsonData.downloadUrl = downloadUrl;
//       jsonData.targetUrl = url;
//       jsonData.encode = 'BG2312';


//       // fs.mkdirSync(bookdir1, err => {
//       //   if (err) {
//       //     console.log("创建目录err")
//       //   } else {
//       //     console.log("创建目录成功")
//       //   }
//       // })
//       let total = $("#wrapper .box_con").eq(1); // 获取所以章节元素拿到总章节数
//       let allChilds = total.find("dt,dd");
//       let dts = total.find("dt");
//       let dds = total.find("dd");
//       // 　　　　　// 循环获取每个章节的页面url并push进urls
//       dds.each(function (i, v) {
//         if (i < dds.length) {
//           let eIndex = $(v).find("a").attr('href').split(".")[0];
//           if (urls.indexOf(eIndex) == -1) {
//             urls.push(eIndex)
//           }
//         }
//       })

//       urls = urls.sort(function (a, b) {
//         return a - b;
//       });
//       let newArr = urls.map((i) => {
//         return url + i + ".html"
//       })
//       jsonData.allChapterNumber = newArr.length;
//       let newArr2 = newArr.splice(0, 2);
//       // 　　　　　// 通过async去请求urls里的地址，并通过fetchUrl方法拆分数据。这里的async.mapLimit方法有点类似es6里的promise.all　
//       // async.mapLimit(newArr2,chapter,(url,callback)=>{
//       //     id++
//       //     fetchUrl(url,callback,id);
//       // },(err,results)=>{
//       //     response.send(results);

//       // })
//       var obj = {
//         box: 'box_con',

//         // boxText:total.html(),
//         // allChilds:allChilds.html(),
//         // allChildsNumber:allChilds.length,
//         // dts:dts.html(),
//         // dtsNumber:dts.length,
//         // dds:dds.html(),
//         // ddsNumber:dds.length,
//         arr: newArr2,
//       }
//       console.log(JSON.stringify(jsonData))
//     })
//   res.send(JSON.stringify(jsonData))
// } else {
//   console.log("++++")
//   res.render('index', {
//     title: 'Express'
//   });
// }
